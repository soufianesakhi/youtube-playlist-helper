const playlistBuilderId = "yphPlaylistBuilder";
const playlistBuilderPageId = "yphPlaylistBuilderPage";
const addVideoToPlaylistId = "yphAddVideoToPlaylist";
const addVideoToPlaylistPageId = "yphAddVideoToPlaylistPage";
const idSep = "#";
const addVideoToPlaylistItemPrefix = `${addVideoToPlaylistId}${idSep}`;
const addVideoToPlaylistPageItemPrefix = `${addVideoToPlaylistPageId}${idSep}`;

const contextMenuIds = [];
const addVideoToPlaylistItemsContextIds = [];

window.getSettings().then(buildContextMenus);

/**
 *
 * @param {import("../playlist-editor/src/types/model").Settings} settings
 */
function buildContextMenus(settings) {
  if (!settings.disableContextBuilder) {
    browser.contextMenus.create({
      id: playlistBuilderId,
      title: "Add video to the playlist builder",
      contexts: ["link", "video"],
    });
    browser.contextMenus.create({
      id: playlistBuilderPageId,
      title: "Add video to the playlist builder",
      contexts: ["page"],
      documentUrlPatterns: ["https://www.youtube.com/watch*"],
    });
    contextMenuIds.push(playlistBuilderPageId);
    contextMenuIds.push(playlistBuilderId);
  }

  if (!settings.disableContextSaved) {
    browser.contextMenus.create({
      id: addVideoToPlaylistId,
      title: "Add video to saved playlist",
      contexts: ["link", "video"],
    });
    browser.contextMenus.create({
      id: addVideoToPlaylistPageId,
      title: "Add video to saved playlist",
      contexts: ["page"],
      documentUrlPatterns: ["https://www.youtube.com/watch*"],
    });
    contextMenuIds.push(addVideoToPlaylistId);
    contextMenuIds.push(addVideoToPlaylistPageId);
    buildAddVideoToPlaylistItems();
  }
}

function buildAddVideoToPlaylistItems() {
  window.getPlaylists().then((playlists) => {
    for (const playlist of playlists) {
      const contextId = `${addVideoToPlaylistItemPrefix}${playlist.id}`;
      const pageContextId = `${addVideoToPlaylistPageItemPrefix}${playlist.id}`;
      addVideoToPlaylistItemsContextIds.push(contextId);
      addVideoToPlaylistItemsContextIds.push(pageContextId);
      browser.contextMenus.create({
        id: contextId,
        title: playlist.title,
        parentId: addVideoToPlaylistId,
      });
      browser.contextMenus.create({
        id: pageContextId,
        title: playlist.title,
        parentId: addVideoToPlaylistPageId,
      });
    }
  });
}

async function clearAddVideoToPlaylistItems() {
  await Promise.all(
    [...addVideoToPlaylistItemsContextIds].map(async (contextId) => {
      await browser.contextMenus.remove(contextId);
    })
  );
  addVideoToPlaylistItemsContextIds.length = 0;
}

async function clearContextMenus() {
  await Promise.all(
    [...contextMenuIds, ...addVideoToPlaylistItemsContextIds].map(
      async (contextId) => {
        await browser.contextMenus.remove(contextId);
      }
    )
  );
  contextMenuIds.length = 0;
  addVideoToPlaylistItemsContextIds.length = 0;
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const clickedMenuId = info.menuItemId.toString();
  try {
    if (
      clickedMenuId == playlistBuilderId ||
      clickedMenuId == playlistBuilderPageId
    ) {
      addVideoToPlaylistBuilder(info);
    } else if (
      clickedMenuId.startsWith(addVideoToPlaylistItemPrefix) ||
      clickedMenuId.startsWith(addVideoToPlaylistPageItemPrefix)
    ) {
      addVideoToPlaylist(info, clickedMenuId);
    }
  } catch (error) {
    handleError(error);
  }
});

browser.runtime.onMessage.addListener(async (request) => {
  if (request.cmd === "get-playlist-builder") {
    return await fetchBuilder();
  } else if (request.cmd === "clear-playlist-builder") {
    await saveBuilder([]);
    browser.browserAction.setBadgeText({ text: "" });
    return true;
  } else if (request.cmd === "update-playlist-builder") {
    const playlistBuilder = request.playlistBuilder;
    await saveBuilder(playlistBuilder);
    browser.browserAction.setBadgeText({ text: "" + playlistBuilder.length });
    return true;
  } else if (request.cmd === "focus-playlist-builder") {
    const builderTabs = await openPlaylistBuilderTab();
    if (builderTabs.length > 0) {
      const windowId = builderTabs[0].windowId;
      windowId && (await browser.windows.update(windowId, { focused: true }));
      const tabId = builderTabs[0].id;
      tabId && (await browser.tabs.update(tabId, { active: true }));
      return true;
    }
  } else if (request.cmd === "update-saved-playlists") {
    clearAddVideoToPlaylistItems();
    buildAddVideoToPlaylistItems();
    return true;
  } else if (request.cmd === "create-playlist") {
    await createPlaylist(request.videoIds, request.title);
    return true;
  } else if (request.cmd === "update-settings") {
    const settings = await window.getSettings();
    await clearContextMenus();
    await buildContextMenus(settings);
    return true;
  }
});

/**
 * @param  {string[]} videoIds
 * @param  {string} [title]
 */
async function createPlaylist(videoIds, title) {
  if (videoIds.length == 0) {
    return;
  }
  const playlist = await window.videoService.generatePlaylist(videoIds, title);
  const settings = await window.getSettings();
  let playlistId;
  if (settings.saveCreatedPlaylists) {
    playlistId = await window.savePlaylist(playlist);
  }
  if (settings.openPlaylistEditorAfterCreation) {
    if (settings.saveCreatedPlaylists) {
      await browser.tabs.create({
        url: browser.runtime.getURL(
          `/editor/index.html?id=${playlistId}#/editor`
        ),
      });
    } else {
      const videoIdsParam = videoIds.join(",");
      await browser.tabs.create({
        url: browser.runtime.getURL(
          `/editor/index.html?videoIds=${videoIdsParam}#/editor`
        ),
      });
    }
  } else {
    await window.videoService.openPlaylist(videoIds);
  }
}

async function fetchBuilder() {
  const items = await browser.storage.local.get(playlistBuilderId);
  if (items && items[playlistBuilderId] != null) {
    return items[playlistBuilderId];
  }
  return [];
}

async function saveBuilder(playlistBuilder) {
  const items = {};
  items[playlistBuilderId] = playlistBuilder;
  browser.storage.local.set(items);
}

fetchBuilder().then((playlistBuilder) => {
  if (playlistBuilder.length > 0) {
    browser.browserAction.setBadgeText({ text: "" + playlistBuilder.length });
  }
});

/**
 * @param {browser.contextMenus.OnClickData} info
 */
async function addVideoToPlaylistBuilder(info) {
  const videoId = parseVideoId(info);
  const playlistBuilder = await fetchBuilder();
  playlistBuilder.push(videoId);
  browser.browserAction.setBadgeText({ text: "" + playlistBuilder.length });
  await saveBuilder(playlistBuilder);
  const settings = await window.getSettings();
  /** @type {browser.tabs.Tab[]} */
  let builderTabs = [];
  if (settings.openPlaylistBuilderAfterAdd) {
    builderTabs = await openPlaylistBuilderTab();
  } else {
    builderTabs = await getPlaylistBuilderTab();
  }
  builderTabs.forEach((tab) => browser.tabs.reload(tab.id));
}

/**
 * @param {browser.contextMenus.OnClickData} info
 * @param {string} clickedMenuId
 */
async function addVideoToPlaylist(info, clickedMenuId) {
  const videoId = parseVideoId(info);
  const playlistId = clickedMenuId.split(idSep)[1];
  const playlist = await window.getPlaylist(playlistId);
  playlist.videos.push(videoId);
  await window.savePlaylist(playlist);
  const settings = await window.getSettings();
  if (settings.openSavedPlaylistAfterAdd) {
    await browser.tabs.create({
      url: browser.runtime.getURL(
        `/editor/index.html?id=${playlistId}&saved=true#/editor`
      ),
    });
  }
}

/**
 * @param {browser.contextMenus.OnClickData} info
 */
function parseVideoId(info) {
  const link = info.linkUrl || info.pageUrl;
  const videoId = link && window.videoService.parseYoutubeId(link);
  if (!videoId) {
    throw new Error("Invalid YouTube video link: " + link);
  }
  return videoId;
}

async function getPlaylistBuilderTab() {
  const tabs = await browser.tabs.query({
    url: browser.runtime.getURL(`/editor/index.html`),
  });
  return tabs.filter(
    (tab) => tab.url && new URL(tab.url).hash === "#/playlist-builder"
  );
}

async function openPlaylistBuilderTab() {
  const builderTabs = await getPlaylistBuilderTab();
  if (builderTabs.length == 0) {
    await browser.tabs.create({
      url: browser.runtime.getURL(`/editor/index.html#/playlist-builder`),
    });
    return [];
  }
  return builderTabs;
}

function handleError(error) {
  alert(error.message);
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
    iconUrl: "icons/icon_48.png",
  });
}
