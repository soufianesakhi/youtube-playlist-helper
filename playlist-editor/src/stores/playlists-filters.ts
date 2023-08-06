import { writable } from "svelte/store";
import type { PlaylistsSorting } from "../types/model.js";

const playlistsSortingStorageKey = "playlistsSorting";
const defaultPlaylistsSorting: PlaylistsSorting = "date-created-desc";

export const playlistsSorting = writable<PlaylistsSorting>(
  defaultPlaylistsSorting
);
export const playlistsSearch = writable("");

window
  .fetchObject(playlistsSortingStorageKey, defaultPlaylistsSorting)
  .then(playlistsSorting.set);
playlistsSorting.subscribe((sorting) => {
  window.storeObject(playlistsSortingStorageKey, sorting);
});
