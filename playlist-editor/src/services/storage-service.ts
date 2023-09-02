/// <reference path="../../node_modules/@types/firefox-webext-browser/index.d.ts" />

import type { Playlist, PlaylistExport, Settings } from "../types/model.js";

function playlistToDto(playlist: Playlist) {
  const dto = { ...playlist };
  delete dto.loadedVideos;
  return dto;
}

const PLAYLIST_KEY_PREFIX = "playlist_";

window.savePlaylist = async (playlist: Playlist) => {
  let id = playlist.id;
  if (!playlist.saved) {
    id = await window.generatePlaylistId();
  }
  playlist = {
    timestamp: Date.now(),
    ...playlist,
    id,
  };
  await window.storeObject(PLAYLIST_KEY_PREFIX + id, playlistToDto(playlist));
  savedPlaylistsChanged();
  return id;
};

window.importPlaylists = async (playlistsExport: PlaylistExport[]) => {
  const ids = await window.generatePlaylistIds(playlistsExport.length);
  const playlists = playlistsExport.map((p) => ({ ...p, id: ids.shift() }));
  await Promise.all(
    playlists.map((playlist) =>
      window.storeObject(
        PLAYLIST_KEY_PREFIX + playlist.id,
        playlistToDto(playlist)
      )
    )
  );
  savedPlaylistsChanged();
};

window.removePlaylist = async (playlist: Playlist) => {
  if (!playlist.saved) {
    // Recent playlist
    localStorage.removeItem(PLAYLIST_KEY_PREFIX + playlist.id);
  } else {
    await window.removeObject(PLAYLIST_KEY_PREFIX + playlist.id);
    savedPlaylistsChanged();
  }
};

window.removeSavedPlaylists = async () => {
  const ids = (await window.getPlaylists()).map(({ id }) => id);
  await Promise.all(
    ids.map((id) => window.removeObject(PLAYLIST_KEY_PREFIX + id))
  );
  savedPlaylistsChanged();
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
  window.fetchObject = async (id, defaultValue) => {
    const result = await browser.storage.sync.get(id);
    if (result && result[id] != null) {
      if (typeof defaultValue === "number") {
        return +result[id];
      }
      return result[id];
    }
    return defaultValue;
  };

  window.fetchAllObjects = async () => {
    return browser.storage.sync.get(null);
  };

  window.storeObject = async (id, obj) => {
    const items = {};
    items[id] = obj
      ? typeof obj === "string"
        ? obj
        : JSON.stringify(obj)
      : null;
    return browser.storage.sync.set(items);
  };

  window.removeObject = async (id) => {
    return browser.storage.sync.remove(id);
  };

  const ID_COUNTER_KEY = "PlaylistIdCounter";
  window.generatePlaylistId = async () => {
    const obj = await browser.storage.sync.get(ID_COUNTER_KEY);
    let count = obj[ID_COUNTER_KEY] || 0;
    count++;
    obj[ID_COUNTER_KEY] = count;
    browser.storage.sync.set(obj);
    return count;
  };

  window.generatePlaylistIds = async (size: number) => {
    const obj = await browser.storage.sync.get(ID_COUNTER_KEY);
    let count = obj[ID_COUNTER_KEY] || 0;
    count++;
    const ids = [...Array(size).keys()].map((i) => i + count);
    obj[ID_COUNTER_KEY] = ids[ids.length - 1];
    browser.storage.sync.set(obj);
    return ids;
  };
} else if (window.location.protocol.startsWith("http")) {
  // Development mode fallback

  window.fetchObject = async (id, defaultValue) => {
    const value = localStorage.getItem(id);
    if (value) {
      const parsed = JSON.parse(value);
      if (typeof defaultValue === "number") {
        return +parsed;
      }
      return parsed;
    }
    return defaultValue;
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

  window.generatePlaylistIds = async (size: number) => {
    const count = Date.now();
    const ids = [...Array(size).keys()].map((i) => (i + count).toString());
    return ids;
  };

  window.removeSavedPlaylists = async () => {};
}

window.getSettings = async () => {
  const DEFAULT_SETTINGS: Settings = {
    openPlaylistEditorAfterCreation: true,
    openPlaylistPage: false,
    closeAfterCombine: false,
    disableThumbnails: false,
    openPlaylistBuilderAfterAdd: true,
    openSavedPlaylistAfterAdd: true,
    defaultEditorPage: "/saved",
    saveCreatedPlaylists: false,
    disableContextBuilder: false,
    disableContextSaved: false,
    themeChoice: "device",
  };
  const settings = { ...DEFAULT_SETTINGS };
  await Promise.all(
    Object.keys(DEFAULT_SETTINGS).map(async (key) => {
      const value = await window.fetchObject(key, DEFAULT_SETTINGS[key]);
      settings[key] = value;
    })
  );
  await migrateSettings(settings);
  return settings;
};

async function migrateSettings(settings) {
  if (settings.createdPlaylistStorage == "saved") {
    settings.saveCreatedPlaylists = true;
    await browser.storage.sync.set({
      saveCreatedPlaylists: settings.saveCreatedPlaylists,
    });
  }
  if (settings.defaultEditorPage == "/recent") {
    settings.defaultEditorPage = "/saved";
    await browser.storage.sync.set({
      defaultEditorPage: settings.defaultEditorPage,
    });
  }
}

function savedPlaylistsChanged() {
  browser.runtime.sendMessage({
    cmd: "update-saved-playlists",
  });
}

export {};
