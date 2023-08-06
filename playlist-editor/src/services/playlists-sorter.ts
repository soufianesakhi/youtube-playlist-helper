import type { Playlist, PlaylistsSorting } from "../types/model.js";

function titleSorter(isAscending: boolean) {
  var multiplier = isAscending ? 1 : -1;
  return (a: Playlist, b: Playlist) => {
    return a.title.localeCompare(b.title) * multiplier;
  };
}
function timestampSorter(isNewFirst: boolean) {
  var multiplier = isNewFirst ? -1 : 1;
  return (a: Playlist, b: Playlist) => {
    return (a.timestamp - b.timestamp) * multiplier;
  };
}

let sorterByType: Record<
  PlaylistsSorting,
  (a: Playlist, b: Playlist) => number
> = {
  "date-created-asc": timestampSorter(false),
  "date-created-desc": timestampSorter(true),
  "title-az": titleSorter(true),
  "title-za": titleSorter(false),
};

export const getPlaylistsSorter = (sortBy: PlaylistsSorting) =>
  sorterByType[sortBy];
