/// <reference path="./popup.d.ts" />
/// <reference path="../../playlist-editor/src/types/services.d.ts" />

/**
 * @typedef {import("webextension-polyfill").Bookmarks.BookmarkTreeNode} BookmarkTreeNode
 * @typedef {import("webextension-polyfill").Tabs.Tab} Tab
 */

const videoService = window.videoService;
const parseYoutubeId = videoService.parseYoutubeId;

window.getSettings().then((settings) => {
  let theme = settings.themeChoice;
  if (theme == "device") {
    theme = window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.dataset.theme = theme;
});

/***********************************
 *               UI
 ***********************************/

getById("open-editor").onclick = async () => {
  const settings = await window.getSettings();
  await browser.tabs.create({
    url: browser.runtime.getURL(
      `/editor/index.html#${settings.defaultEditorPage}`
    ),
  });
  window.close();
};

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
        createPlaylist(folder.videoIds, getFileName(folder.folderName));
        setTimeout(() => window.close(), 10);
      };
      container.append(div);
    });
    activatePopupMenu("from-bookmark-menu");
  });
};

getById("from-builder").onclick = async () => {
  browser.runtime.sendMessage({
    cmd: "focus-playlist-builder",
  });
  window.close();
};

getById("from-urls").onclick = () => {
  activatePopupMenu("from-urls-menu");
};

getById("combine-tabs").onclick = () => {
  activatePopupMenu("combine-tabs-menu");
};

getById("combine-tabs-exclude-playlists").onclick = async () => {
  let tabs = await getCurrentYoutubeTabs();
  if (tabs.length > 0) {
    const videoIds = tabs
      .map((tab) => parseYoutubeId(tab.url || ""))
      .filter(isNotNull);
    const settings = await window.getSettings();
    if (settings.closeAfterCombine) {
      closeTabs(tabs);
    }
    await createPlaylist(videoIds);
  } else {
    alert(
      "There are no valid YouTube video tabs (excluding playlists) in the current window"
    );
  }
  window.close();
};

getById("combine-tabs-current-playlist").onclick = async () => {
  const activeTab = await getActiveTab();
  if (!isYoutubeTab(activeTab)) {
    return alert("The current tab is not a YouTube playlist tab");
  }
  let tabs = await getCurrentYoutubeTabs();
  tabs = tabs.filter((tab) => tab.url != activeTab.url);
  if (tabs.length > 0) {
    const videoIds = tabs
      .map((tab) => parseYoutubeId(tab.url || ""))
      .filter(isNotNull);
    /** @type {any} */ let tabId = activeTab.id;
    const currentPlaylistVideoIds = await browser.tabs.executeScript(tabId, {
      file: "/actions/getPlaylistVideoIds.js",
    });
    if (!currentPlaylistVideoIds[0] || currentPlaylistVideoIds[0].length == 0) {
      return alert("The current tab is not a YouTube playlist tab");
    }
    videoIds.push(...currentPlaylistVideoIds[0]);
    const settings = await window.getSettings();
    if (settings.closeAfterCombine) {
      closeTabs([activeTab, ...tabs]);
    }
    await createPlaylist(videoIds);
  } else {
    return alert(
      "There are no valid YouTube video tabs to combine with the current playlist"
    );
  }
  window.close();
};

getById("combine-tabs-all-playlist").onclick = async () => {
  let tabs = await getCurrentYoutubeTabs(true);
  const videoIds = tabs
    .filter(not(isPlaylistTab))
    .map((tab) => parseYoutubeId(tab.url || ""))
    .filter(isNotNull);
  const playlistsVideoIdsArray = await Promise.all(
    tabs.filter(isPlaylistTab).map(async (tab) => {
      /** @type {any} */ let tabId = tab.id;
      const result = await browser.tabs.executeScript(tabId, {
        file: "/actions/getPlaylistVideoIds.js",
      });
      /** @type {string[]} */ const videoIds = result[0];
      return videoIds;
    })
  );
  const playlistsVideoIds = playlistsVideoIdsArray.reduce(
    (acc, val) => acc.concat(val),
    []
  );
  videoIds.push(...playlistsVideoIds);
  if (videoIds.length > 0) {
    const settings = await window.getSettings();
    if (settings.closeAfterCombine) {
      closeTabs(tabs);
    }
    await createPlaylist(videoIds);
  } else {
    return alert("There are no valid YouTube tabs to combine");
  }
  window.close();
};

getById("from-current-links").onclick = async () => {
  let body = await getCurrentTabBody();
  let videoIds = [
    ...parseYoutubeLinks(body),
    ...parseYoutubeThumbnailIds(body),
  ];
  videoIds = removeDuplicates(videoIds);
  if (videoIds.length > 0) {
    await createPlaylist(videoIds);
  } else {
    alert("No YouTube video link found in the current tab");
  }
  window.close();
};

getById("convert-playlist-to-queue").onclick = async () => {
  const activeTab = await getActiveTab();
  if (!(isYoutubeTab(activeTab) && isPlayingPlaylistTab(activeTab))) {
    return alert("The current tab is not a YouTube playlist tab");
  }
  /** @type {any} */ let tabId = activeTab.id;
  await browser.tabs.executeScript(tabId, {
    file: "/actions/convert-playlist-to-queue.js",
  });
  window.close();
};

getById("save-playlist").onclick = async () => {
  const activeTab = await getActiveTab();
  if (!isYoutubeTab(activeTab)) {
    return alert("The current tab is not a YouTube playlist tab");
  }
  /** @type {any} */ let tabId = activeTab.id;
  const result = await browser.tabs.executeScript(tabId, {
    file: "/actions/getPlaylistVideoIds.js",
  });
  const videoIds = result[0];
  if (!videoIds || videoIds.length == 0) {
    return alert("The current tab is not a YouTube playlist tab");
  }
  const playlist = await videoService.generatePlaylist(videoIds);
  const id = await window.savePlaylist(playlist);
  await browser.tabs.create({
    url: browser.runtime.getURL(
      `/editor/index.html?id=${id}&saved=true#/editor`
    ),
  });
  window.close();
};

getById("open-settings").onclick = async () => {
  await browser.tabs.create({
    url: browser.runtime.getURL("/options/options.html"),
  });
  window.close();
};

getById("open-support").onclick = async () => {
  await browser.tabs.create({
    url: browser.runtime.getURL("/editor/index.html#/support"),
  });
  window.close();
};

queryAll(".back-item").forEach((item) => {
  item.onclick = () => {
    activatePopupMenu("main-menu");
  };
});

getById("create-from-urls").onclick = () =>
  createPlaylistFromTextArea("urlsTextarea");

async function createPlaylistFromTextArea(id) {
  // @ts-ignore
  const text = getById(id).value;
  const videoIds = videoService.parseYoutubeIds(text);
  await createPlaylist(videoIds);
  window.close();
}

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
 * @param  {BookmarkTreeNode[]} tree
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

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

async function getCurrentTabBody() {
  const result = await browser.tabs.executeScript({
    code: `document.body.innerHTML`,
    allFrames: false, // this is the default
    runAt: "document_start",
  });
  console.log(result);
  return result[0];
}

/**
 * @param  {Tab[]} tabs
 */
function closeTabs(tabs) {
  const ids = tabs.map((tab) => tab.id).filter(isNotNull);
  browser.tabs.remove(ids);
}

/**
 * @param {boolean} [includePlaylistTabs]
 */
async function getCurrentYoutubeTabs(includePlaylistTabs) {
  let tabs = await getCurrentWindowTabs();
  if (includePlaylistTabs) {
    tabs = tabs.filter(isYoutubeTab);
  } else {
    tabs = tabs.filter(isVideoTab);
    tabs = tabs.filter(not(isPlaylistTab));
  }
  return tabs;
}

/**
 * @param  {Tab} tab
 */
function isPlaylistTab(tab) {
  const url = tab.url || "";
  return /[&\?]list=/i.test(url);
}

/**
 * @param  {Tab} tab
 */
function isPlayingPlaylistTab(tab) {
  const url = tab.url || "";
  return isPlaylistTab(tab) && !url.includes("/playlist");
}

/**
 * @param  {Tab} tab
 */
function isVideoTab(tab) {
  const regex = RegExp(youtubeRegexPattern, "i");
  const url = tab.url || "";
  return regex.test(url);
}

/**
 * @param  {Tab} tab
 */
function isYoutubeTab(tab) {
  /** @type {any} */ const url = tab.url;
  return url.indexOf("youtube.com/") > 0;
}

/***********************************
 *            Parsing
 ***********************************/

const { youtubeRegexPattern } = window;

const youtubeThumbnailsRegexPattern =
  /(?:img\.youtube|i\.ytimg|i1\.ytimg)\.com\/vi\/([^\/\s]+)/.source;

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
 * @param  {string} text
 */
function parseYoutubeLinks(text) {
  let matches,
    videoIds = [];
  const regex = RegExp(youtubeRegexPattern, "ig");
  while ((matches = regex.exec(text))) {
    const videoId = matches[1].replace(/"$/, "");
    videoIds.push(videoId);
  }
  return videoIds;
}

/***********************************
 *            Playlists
 ***********************************/

/**
 * @param  {string[]} videoIds
 * @param  {string} [title]
 */
async function createPlaylist(videoIds, title) {
  await browser.runtime.sendMessage({
    cmd: "create-playlist",
    videoIds,
    title,
  });
}

/***********************************
 *            Utils
 ***********************************/

/**
 * @param {(value: T) => boolean} predicate
 * @returns {(value: T) => boolean}
 * @template T
 */
function not(predicate) {
  return (value) => {
    return !predicate(value);
  };
}
/**
 * @param {T | null | undefined} argument
 * @returns {argument is T}
 * @template T
 */
function isNotNull(argument) {
  return argument != null;
}

/**
 * @param  {string} id
 * @returns {HTMLInputElement}
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
 * @param {boolean=} isInfo
 */
async function alert(message, isInfo) {
  browser.notifications.create({
    type: "basic",
    title: "YouTube Playlist Helper" + (isInfo ? "" : ": Error"),
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

function getFileName(fullPath) {
  const split = fullPath.split(/[\/\\]/);
  return split.pop() || split.pop();
}
