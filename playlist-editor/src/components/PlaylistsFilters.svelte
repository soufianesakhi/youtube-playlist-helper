<script lang="ts">
  import { get } from "svelte/store";
  import { getPlaylistsSorter } from "../services/playlists-sorter.js";
  import { playlistsSorting } from "../stores/playlists-filters.js";
  import type { Playlist, PlaylistsSorting } from "../types/model.js";
  import { onMount } from "svelte";

  export let playlists: Playlist[];

  onMount(() => {
    sortPlaylists();
  });

  let sortBy = get(playlistsSorting);
  function sortingChanged() {
    playlistsSorting.set(sortBy);
    sortPlaylists();
  }
  function sortPlaylists() {
    playlists = playlists.sort(getPlaylistsSorter(sortBy));
  }
  const sortOptions: Record<PlaylistsSorting, string> = {
    "date-created-desc": "Date created (descending)",
    "date-created-asc": "Date created (ascending)",
    "title-az": "Title (A -> Z)",
    "title-za": "Title (Z -> A)",
  };
</script>

<aside>
  <h2 style="margin: 0">
    {playlists.length} playlist{playlists.length > 1 ? "s" : ""}
  </h2>
  <label>
    Sort by
    <select bind:value={sortBy} on:change={sortingChanged}>
      {#each Object.entries(sortOptions) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
  </label>
</aside>

<style>
  aside {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 2rem;
  }
  label > * {
    margin-left: 0.5rem;
  }
</style>
