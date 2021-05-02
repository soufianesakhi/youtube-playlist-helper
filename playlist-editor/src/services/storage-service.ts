/// <reference path="../types/services.d.ts" />
/// <reference path="../../node_modules/@types/firefox-webext-browser/index.d.ts" />

function playlistToDto(playlist: Playlist) {
  const videos = playlist.videos;
  if (videos.length > 0 && typeof videos[0] !== "string") {
    const videoIds = (videos as Video[]).map((video) => video.videoId);
    playlist = { ...playlist, videos: videoIds };
  }
  return playlist;
}

const PLAYLIST_KEY_PREFIX = "playlist_";

window.saveRecentPlaylist = async (playlist: Playlist) => {
  localStorage.setItem(
    PLAYLIST_KEY_PREFIX + playlist.id,
    JSON.stringify(playlistToDto(playlist))
  );
};

window.getRecentPlaylists = async () => {
  const items = { ...localStorage };
  const playlists = Object.keys(items)
    .filter((key) => key.startsWith(PLAYLIST_KEY_PREFIX))
    .map((key) => JSON.parse(items[key]) as Playlist);
  return playlists;
};

if (typeof browser != "undefined") {
  const storage = browser.storage.sync;

  window.fetchObject = async (id, defaultValue) => {
    const result = await browser.storage.sync.get(id);
    if (result && result[id] != null) {
      return result[id];
    }
    return defaultValue;
  };

  window.storeObject = async (id, obj) => {
    const items = {};
    items[id] = obj ? JSON.stringify(obj) : null;
    return storage.set(items);
  };

  const ID_COUNTER_KEY = "PlaylistIdCounter";
  window.generatePlaylistId = async () => {
    const obj = await storage.get(ID_COUNTER_KEY);
    let count = obj[ID_COUNTER_KEY] || 0;
    count++;
    obj[ID_COUNTER_KEY] = count;
    storage.set(obj);
    return count;
  };

  window.savePlaylist = async (playlist: Playlist) => {
    return window.storeObject(
      PLAYLIST_KEY_PREFIX + playlist.id,
      playlistToDto(playlist)
    );
  };

  window.getPlaylists = async () => {
    const allItems = await storage.get(null);
    return Object.keys(allItems)
      .filter((key) => key.startsWith(PLAYLIST_KEY_PREFIX))
      .map((key) => JSON.parse(allItems[key]));
  };
} else if (window.location.protocol.startsWith("http")) {
  // Development mode fallback

  window.fetchObject = async (id, defaultValue) => {
    const value = localStorage.getItem(id);
    return (value && JSON.parse(value)) || defaultValue;
  };

  window.storeObject = async (id, obj) => {
    localStorage.setItem(id, obj ? JSON.stringify(obj) : null);
  };

  window.generatePlaylistId = async () => {
    return Date.now().toString();
  };

  window.savePlaylist = window.saveRecentPlaylist;
  window.getPlaylists = window.getRecentPlaylists;
}

const DEFAULT_SETTINGS: Settings = {
  openPlaylistPage: false,
  closeAfterCombine: false,
};
window.getSettings = async () => {
  const settings = { ...DEFAULT_SETTINGS };
  await Promise.all(
    Object.keys(DEFAULT_SETTINGS).map(async (key) => {
      const value = await window.fetchObject(key, DEFAULT_SETTINGS[key]);
      settings[key] = value;
    })
  );
  return settings;
};

export {};
