<script lang="ts">
  import LoadingModal from "./LoadingModal.svelte";
  import PlaylistPreview from "./PlaylistPreview.svelte";

  export let playlists: Playlist[];

  let loading = true;
  const playlistsAsync = Promise.all(
    playlists.map(async (playlist) => {
      playlist.loadedVideos = await Promise.all(
        playlist.videos
          .slice(0, 3)
          .map((id) => window.videoService.fetchVideo(id))
      );
      return playlist;
    })
  );
  playlistsAsync.finally(() => (loading = false));
</script>

<div class="selector">
  {#await playlistsAsync then loadedPlaylists}
    {#each loadedPlaylists as playlist (playlist.id)}
      <PlaylistPreview {playlist} />
    {:else}
      <p style="text-align: center">No playlist found</p>
    {/each}
  {/await}
</div>

{#if loading}
  <LoadingModal />
{/if}

<style>
  .selector {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 10px;
  }
</style>
