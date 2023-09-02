<script lang="ts">
  import { get } from "svelte/store";
  import { getPlaylistsSorter } from "../services/playlists-sorter.js";
  import {
    playlistsSearch,
    playlistsSorting,
  } from "../stores/playlists-filters.js";
  import type { Playlist, PlaylistsSorting } from "../types/model.js";
  import { onMount } from "svelte";

  export let playlists: Playlist[];
  export let filteredPlaylists: Playlist[];

  let sortBy = get(playlistsSorting);
  let search = get(playlistsSearch);
  $: sortBy, filtersUpdated();
  $: search, filtersUpdated();
  filtersUpdated();

  const sortOptions: Record<PlaylistsSorting, string> = {
    "date-created-desc": "Date created (descending)",
    "date-created-asc": "Date created (ascending)",
    "title-az": "Title (A -> Z)",
    "title-za": "Title (Z -> A)",
  };

  function sortingChanged() {
    playlistsSorting.set(sortBy);
  }

  function searchChanged() {
    playlistsSearch.set(search);
  }

  function filtersUpdated() {
    filteredPlaylists = playlists.sort(getPlaylistsSorter(sortBy));
    const keywords = search
      .split(/\s+/)
      .filter((k) => k.length)
      .map((k) => k.toLowerCase());
    if (keywords.length) {
      filteredPlaylists = filteredPlaylists.filter((playlist) =>
        keywords.every((k) => playlist.title.toLowerCase().includes(k))
      );
    }
  }
</script>

<aside>
  <h2 style="margin: 0; flex-grow: 1; text-align: center;">
    {filteredPlaylists.length} playlist{filteredPlaylists.length > 1 ? "s" : ""}
  </h2>
  <label style="flex-grow: 2">
    <span style="width: 30%">Search</span>
    <input
      type="text"
      bind:value={search}
      on:input={searchChanged}
      style="width: 70%"
    />
  </label>
  <label style="min-width: fit-content;">
    <span>Sort by</span>
    <select bind:value={sortBy} on:change={sortingChanged}>
      {#each Object.entries(sortOptions) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
  </label>
</aside>

<style>
  aside {
    padding: 1rem 0;
    position: sticky;
    top: 0;
    background-color: var(--background-color);
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
