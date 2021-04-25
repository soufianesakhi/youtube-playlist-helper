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
    const obj = {};
    obj[PLAYLIST_KEY_PREFIX + playlist.id] = JSON.stringify(
      playlistToDto(playlist)
    );
    storage.set(obj);
  };
} else if (window.location.protocol.startsWith("http")) {
  // Development mode fallback

  window.generatePlaylistId = async () => {
    return Date.now().toString();
  };

  window.savePlaylist = window.saveRecentPlaylist;
}

export {};
