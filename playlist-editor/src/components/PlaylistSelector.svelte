<script lang="ts">
  import PlaylistPreview from "./PlaylistPreview.svelte";

  export let playlists: Playlist[];

  let disableThumbnails = true;
  window.getSettings().then((settings) => {
    disableThumbnails = settings.disableThumbnails;
  });
</script>

<div class="selector">
  {#each playlists as playlist (playlist.id)}
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
    padding: 10px;
  }
</style>
