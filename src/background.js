const playlistBuilderId = "yphPlaylistBuilder";
const playlistBuilderPageId = "yphPlaylistBuilderPage";

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

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    [playlistBuilderPageId, playlistBuilderId].indexOf("" + info.menuItemId) >
    -1
  ) {
    const link = info.linkUrl || info.pageUrl;
    if (!link || !(await addLinkToPlaylistBuilder(link))) {
      alert("Invalid YouTube video link: " + link, true);
      return;
    }
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
  }
});

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

async function addLinkToPlaylistBuilder(link) {
  const id = window.videoService.parseYoutubeId(link);
  if (id) {
    const playlistBuilder = await fetchBuilder();
    playlistBuilder.push(id);
    browser.browserAction.setBadgeText({ text: "" + playlistBuilder.length });
    saveBuilder(playlistBuilder);
    return true;
  }
  return false;
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
