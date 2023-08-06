<script lang="ts">
  import type { Playlist } from "../types/model.js";
  import PlaylistPreview from "./PlaylistPreview.svelte";
  import PlaylistsFilters from "./PlaylistsFilters.svelte";

  export let playlists: Playlist[];
  let filteredPlaylists = playlists;

  let disableThumbnails = true;
  window.getSettings().then((settings) => {
    disableThumbnails = settings.disableThumbnails;
  });
</script>

{#if playlists.length > 0}
  <PlaylistsFilters bind:playlists bind:filteredPlaylists />
{/if}

<div class="selector">
  {#each filteredPlaylists as playlist (playlist.id)}
    <PlaylistPreview {playlist} {disableThumbnails} />
  {:else}
    <p style="text-align: center">No playlist found</p>
  {/each}
</div>

<style>
  .selector {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding-top: 2rem;
  }
</style>
