/// <reference path="./popup.d.ts" />

// @ts-ignore
document.getElementById("from-bookmark").onclick = () => {
  /** @type {HTMLElement} container */
  // @ts-ignore
  const container = document.getElementById("bookmarks");
  container.innerHTML = "";
  getYoutubeFolderBookmarks().then((bookmarks) => {
    bookmarks.forEach((folder) => {
      const div = document.createElement("div");
      div.textContent = folder.folderName;
      div.className = "menu-item list-group-item";
      div.onclick = () => {
        createPlaylist(folder.videoIds);
      };
      container.append(div);
    });
    activatePopupMenu("from-bookmark-menu");
  });
};

// @ts-ignore
document.getElementById("from-urls").onclick = () => {
  activatePopupMenu("from-urls-menu");
};

document.querySelectorAll(".back-item").forEach(
  /** @param {HTMLElement} item */
  // @ts-ignore
  (item) => {
    item.onclick = () => {
      activatePopupMenu("main-menu");
    };
  }
);

/**
 * @param  {string} menuId
 */
function activatePopupMenu(menuId) {
  document.querySelectorAll(".popup-menu").forEach(
    /** @param {HTMLElement} menu */
    // @ts-ignore
    (menu) => {
      menu.style.display = "none";
    }
  );
  // @ts-ignore
  document.getElementById(menuId).style.display = "block";
}

/***********************************
 *            Bookmarks
 ***********************************/

const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(.*v=|v\/)([^&\s]+)/i;

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
      const videoId = captureYoutubeId(node.url);
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
    bookmarks.push(currentBookmarks);
  }
  return bookmarks;
}

/**
 * @param  {string} url
 */
function captureYoutubeId(url) {
  const result = youtubeRegex.exec(url);
  if (result && result.length > 2) {
    return result[2];
  }
  return null;
}

/***********************************
 *            Playlists
 ***********************************/

/**
 * @param  {string[]} videoIds
 */
function createPlaylist(videoIds) {
  if (videoIds.length == 0) {
    return;
  }
  var url =
    "https://www.youtube.com/watch_videos?video_ids=" + videoIds.join(",");
  window.open(url, "_blank");
}
