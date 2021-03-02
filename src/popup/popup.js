/// <reference path="./popup.d.ts" />

let openPlaylistPage = false;
let includePlaylistTabs = false;
loadSettings();

async function loadSettings() {
  openPlaylistPage = await loadOption("open_playlist_page", openPlaylistPage);
  includePlaylistTabs = await loadOption("include_playlist_tabs", includePlaylistTabs);
}

/**
 * @param {string} id
 * @param {any} defaultValue
 */
async function loadOption(id, defaultValue) {
  const result = await browser.storage.sync.get(id);
  if (result && result[id] != null) {
    return result[id];
  }
  return defaultValue;
}

/***********************************
 *               UI
 ***********************************/

getById("from-bookmark").onclick = () => {
  const container = getById("bookmarks");
  container.innerHTML = "";
  getYoutubeFolderBookmarks().then((bookmarks) => {
    if (bookmarks.length == 0) {
      const div = document.createElement("div");
      div.textContent = "No folder containing YouTube links found";
      div.style.textAlign = "center";
      div.style.padding = "10px";
      container.append(div);
    }
    bookmarks.forEach((folder) => {
      const div = document.createElement("div");
      div.textContent = folder.folderName;
      div.className = "menu-item";
      div.onclick = () => {
        createPlaylist(folder.videoIds);
      };
      container.append(div);
    });
    activatePopupMenu("from-bookmark-menu");
  });
};

getById("from-urls").onclick = () => {
  activatePopupMenu("from-urls-menu");
};

getById("from-current-tabs").onclick = async () => {
  const regex = RegExp(youtubeRegexPattern, "i");
  let tabs = await getCurrentWindowTabs();
  tabs = tabs.filter((tab) => tab.url && regex.test(tab.url));
  if (!includePlaylistTabs) {
    tabs = tabs.filter(tab => tab.url && tab.url.indexOf("&list=") < 0);
  }
  if (tabs.length > 0) {
    /** @type {string[]} */
    // @ts-ignore
    const videoIds = tabs.map((tab) => parseYoutubeId(tab.url));
    closeTabs(tabs);
    await createPlaylist(videoIds);
  } else {
    alert("There are no valid YouTube tabs in the current window");
  }
};

getById("from-current-thumbnails").onclick = async () => {
  let body = await getCurrentTabBody();
  let videoIds = parseYoutubeThumbnailIds(body);
  videoIds = removeDuplicates(videoIds);
  if (videoIds.length > 0) {
    await createPlaylist(videoIds);
  } else {
    alert("No YouTube video thumbnail found in the current tab");
  }
};

queryAll(".back-item").forEach((item) => {
  item.onclick = () => {
    activatePopupMenu("main-menu");
  };
});

getById("create-from-urls").onclick = () => {
  // @ts-ignore
  const text = getById("urlsTextarea").value;
  const videoIds = parseYoutubeIds(text);
  createPlaylist(videoIds);
};

/**
 * @param  {string} menuId
 */
function activatePopupMenu(menuId) {
  queryAll(".popup-menu").forEach((menu) => {
    menu.style.display = "none";
  });
  getById(menuId).style.display = "block";
}

/***********************************
 *            Bookmarks
 ***********************************/

async function getYoutubeFolderBookmarks() {
  const tree = await browser.bookmarks.getTree();
  return recursiveCollectBookmarks("", tree);
}

/**
 * @param  {string} parentFolder
 * @param  {browser.bookmarks.BookmarkTreeNode[]} tree
 * @returns {YouTubeBookmarks[]}
 */
function recursiveCollectBookmarks(parentFolder, tree) {
  /** @type { YouTubeBookmarks[] } */
  let bookmarks = [];
  if (!tree) {
    return bookmarks;
  }
  /** @type { YouTubeBookmarks? } */
  let currentBookmarks = null;
  tree.forEach((node) => {
    if (node.type && node.type == "separator") {
      return;
    }
    if (node.children && node.children.length > 0) {
      bookmarks.push(
        ...recursiveCollectBookmarks(
          parentFolder + node.title + "/",
          node.children
        )
      );
    } else {
      if (!node.url) {
        return;
      }
      const videoId = parseYoutubeId(node.url);
      if (videoId) {
        if (!currentBookmarks) {
          currentBookmarks = {
            folderName: parentFolder,
            videoIds: [videoId],
          };
        } else {
          currentBookmarks.videoIds.push(videoId);
        }
      }
    }
  });
  if (currentBookmarks) {
    bookmarks.unshift(currentBookmarks);
  }
  return bookmarks;
}

/***********************************
 *            Tabs
 ***********************************/

function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

async function getCurrentTabBody() {
  const result = await browser.tabs.executeScript({
    code: `document.body.innerHTML`,
    allFrames: false, // this is the default
    runAt: 'document_start',
  });
  console.log(result);
  return result[0];
}

/**
 * @param  {browser.tabs.Tab[]} tabs
 */
function closeTabs(tabs) {
  /** @type {number[]} */
  // @ts-ignore
  const ids = tabs.map((tab) => tab.id);
  browser.tabs.remove(ids);
}

/***********************************
 *            Parsing
 ***********************************/

// https://regex101.com/r/mPyKKP/1/
const youtubeRegexPattern = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/
  .source;
const youtubeThumbnailsRegexPattern = /(?:img\.youtube|i\.ytimg|i1\.ytimg)\.com\/vi\/([^\/\s]+)/.source;

/**
 * @param  {string} text
 */
function parseYoutubeIds(text) {
  let matches,
    videoIds = [];
  const regex = RegExp(youtubeRegexPattern, "ig");
  while ((matches = regex.exec(text))) {
    videoIds.push(matches[1]);
  }
  return videoIds;
}

/**
 * @param  {string} text
 */
function parseYoutubeThumbnailIds(text) {
  let matches,
    videoIds = [];
  const regex = RegExp(youtubeThumbnailsRegexPattern, "ig");
  while ((matches = regex.exec(text))) {
    videoIds.push(matches[1]);
  }
  return videoIds;
}

/**
 * @param  {string} url
 */
function parseYoutubeId(url) {
  const result = RegExp(youtubeRegexPattern, "i").exec(url);
  if (result && result.length > 1) {
    return result[1];
  }
  return null;
}

/***********************************
 *            Playlists
 ***********************************/

/**
 * @param  {string[]} videoIds
 */
async function createPlaylist(videoIds) {
  if (videoIds.length == 0) {
    return;
  }
  const chunkSize = 50;
  // @ts-ignore
  const videoIdsChunks = new Array(Math.ceil(videoIds.length / chunkSize)).fill().map(_ => videoIds.splice(0, chunkSize));
  videoIdsChunks.forEach(async videoIds => {
    var url =
    "https://www.youtube.com/watch_videos?video_ids=" + videoIds.join(",");
    if (openPlaylistPage) {
      const data = await (await fetch(url)).text();
      const exec = /og:video:url[^>]+\?list=([^"']+)/.exec(data);
      if (exec && exec.length > 1) {
        url =
          "https://www.youtube.com/playlist?list=" +
          exec[1];
      } else {
        alert(
          "Unable to retrieve playlist id. Directly playing videos instead..."
        );
      }
    }
    return browser.tabs.create({ url });
  });
}

/***********************************
 *            Utils
 ***********************************/

/**
 * @param  {string} id
 * @returns {HTMLElement}
 */
function getById(id) {
  // @ts-ignore
  return document.getElementById(id);
}
/**
 * @param  {string} selector
 * @returns {NodeListOf<HTMLElement>}
 */
function queryAll(selector) {
  return document.querySelectorAll(selector);
}

/**
 * @param {string} message
 */
async function alert(message) {
  browser.notifications.create({
    type: "basic",
    title: `YouTube Playlist Helper: Error`,
    message: message,
    iconUrl: "../icons/icon_48.png",
  });
}

/**
 * @param  {string[]} array
 * @returns {string[]}
 */
function removeDuplicates(array) {
  return Array.from(new Set(array));
}
