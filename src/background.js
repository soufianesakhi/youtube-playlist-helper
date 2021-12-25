const playlistBuilderId = "yphPlaylistBuilder";

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    id: playlistBuilderId,
    title: "Add video to the playlist builder",
    contexts: ["link", "video"]
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === playlistBuilderId) {
    const link = info.linkUrl || info.pageUrl;
    if (!link) {
      console.log("Could not find YouTube video link:", info);
      return;
    }
    addLinkToPlaylistBuilder(link);
  }
});

browser.runtime.onMessage.addListener(async request => {
  if (request.cmd === "get-playlist-builder") {
    return await fetchBuilder();
  } else if (request.cmd === "clear-playlist-builder") {
    await saveBuilder([]);
    browser.browserAction.setBadgeText({ text: "" })
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
