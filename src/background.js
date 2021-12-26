const playlistBuilderId = "yphPlaylistBuilder";
const playlistBuilderPageId = "yphPlaylistBuilderPage";

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    id: playlistBuilderId,
    title: "Add video to the playlist builder",
    contexts: ["link", "video"]
  });
  browser.contextMenus.create({
    id: playlistBuilderPageId,
    title: "Add video to the playlist builder",
    contexts: ["page"],
    documentUrlPatterns: ["https://www.youtube.com/watch*"]
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if ([playlistBuilderPageId, playlistBuilderId].indexOf("" + info.menuItemId) > -1) {
    const link = info.linkUrl || info.pageUrl;
    if (!link) {
      console.log("Could not find YouTube video link:", info);
      return;
    }
    addLinkToPlaylistBuilder(link);
    const tabs = await browser.tabs.query({
      url: browser.runtime.getURL(
        `/editor/index.html`
      )
    });
    const builderTabs = tabs.filter(tab => tab.url && new URL(tab.url).hash === "#/playlist-builder");
    if (builderTabs.length == 0) {
      await browser.tabs.create({
        url: browser.runtime.getURL(
          `/editor/index.html#/playlist-builder`
        ),
      });
    } else {
      builderTabs.forEach(tab => browser.tabs.reload(tab.id));
    }
  }
});

browser.runtime.onMessage.addListener(async request => {
  if (request.cmd === "get-playlist-builder") {
    return await fetchBuilder();
  } else if (request.cmd === "clear-playlist-builder") {
    await saveBuilder([]);
    browser.browserAction.setBadgeText({ text: "" })
    return true;
  } else if (request.cmd === "update-playlist-builder") {
    const playlistBuilder = request.playlistBuilder;
    await saveBuilder(playlistBuilder);
    browser.browserAction.setBadgeText({ text: "" + playlistBuilder.length })
    return true;
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

fetchBuilder().then(playlistBuilder => {
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
  }
}
