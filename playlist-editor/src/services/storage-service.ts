/// <reference path="../types/services.d.ts" />
/// <reference path="../../node_modules/@types/firefox-webext-browser/index.d.ts" />

function playlistToDto(playlist: Playlist) {
  const dto = { ...playlist };
  delete dto.loadedVideos;
  return dto;
}

const PLAYLIST_KEY_PREFIX = "playlist_";

window.saveRecentPlaylist = async (playlist: Playlist) => {
  localStorage.setItem(
    PLAYLIST_KEY_PREFIX + playlist.id,
    JSON.stringify(playlistToDto(playlist))
  );
  return playlist.id;
};

window.getRecentPlaylists = async () => {
  const items = { ...localStorage };
  const playlists = Object.keys(items)
    .filter((key) => key.startsWith(PLAYLIST_KEY_PREFIX))
    .map((key) => JSON.parse(items[key]) as Playlist);
  return playlists;
};

window.getRecentPlaylist = async (id) => {
  const item = localStorage.getItem(PLAYLIST_KEY_PREFIX + id);
  return JSON.parse(item);
};

window.savePlaylist = async (playlist: Playlist) => {
  let id = playlist.id;
  if (!playlist.saved) {
    id = await window.generatePlaylistId();
  }
  playlist = {
    ...playlist,
    id,
    timestamp: Date.now(),
  };
  await window.storeObject(PLAYLIST_KEY_PREFIX + id, playlistToDto(playlist));
  return id;
};

window.removePlaylist = async (playlist: Playlist) => {
  if (!playlist.saved) {
    // Recent playlist
    localStorage.removeItem(PLAYLIST_KEY_PREFIX + playlist.id);
  } else {
    return window.removeObject(PLAYLIST_KEY_PREFIX + playlist.id);
  }
};

window.getPlaylists = async () => {
  const allItems = await window.fetchAllObjects();
  return Object.keys(allItems)
    .filter((key) => key.startsWith(PLAYLIST_KEY_PREFIX))
    .map((key) => {
      const playlist: Playlist = JSON.parse(allItems[key]);
      playlist.saved = true;
      return playlist;
    });
};

window.getPlaylist = async (id) => {
  const item = await window.fetchObject(PLAYLIST_KEY_PREFIX + id, null);
  if (!item) {
    return null;
  }
  const playlist: Playlist = JSON.parse(item);
  playlist.saved = true;
  return playlist;
};

if (typeof browser != "undefined") {
  const storage = browser.storage.sync;

  window.fetchObject = async (id, defaultValue) => {
    const result = await storage.get(id);
    if (result && result[id] != null) {
      return result[id];
    }
    return defaultValue;
  };

  window.fetchAllObjects = async () => {
    return storage.get(null);
  };

  window.storeObject = async (id, obj) => {
    const items = {};
    items[id] = obj ? JSON.stringify(obj) : null;
    return storage.set(items);
  };

  window.removeObject = async (id) => {
    return storage.remove(id);
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
} else if (window.location.protocol.startsWith("http")) {
  // Development mode fallback

  window.fetchObject = async (id, defaultValue) => {
    const value = localStorage.getItem(id);
    return (value && JSON.parse(value)) || defaultValue;
  };

  window.fetchAllObjects = async () => {
    return { ...localStorage };
  };

  window.storeObject = async (id, obj) => {
    localStorage.setItem(id, obj ? JSON.stringify(obj) : null);
  };

  window.removeObject = async (id) => {
    localStorage.removeItem(id);
  };

  window.generatePlaylistId = async () => {
    return Date.now().toString();
  };
}

const DEFAULT_SETTINGS: Settings = {
  openPlaylistEditorAfterCreation: false,
  openPlaylistPage: false,
  closeAfterCombine: false,
  disableThumbnails: false,
  defaultEditorPage: "/recent",
  createdPlaylistStorage: "recent"
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
