import { writable } from "svelte/store";
import type { PlaylistsSorting } from "../types/model.js";

const storageKey = "playlistsSorting";
const defaultPlaylistsSorting: PlaylistsSorting = "date-created-desc";

export const playlistsSorting = writable<PlaylistsSorting>(
  defaultPlaylistsSorting
);

window
  .fetchObject(storageKey, defaultPlaylistsSorting)
  .then(playlistsSorting.set);
playlistsSorting.subscribe((sorting) => {
  window.storeObject(storageKey, sorting);
});
