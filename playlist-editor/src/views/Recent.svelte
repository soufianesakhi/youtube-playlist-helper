<script>
  import PlaylistSelector from "../components/PlaylistSelector.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  const playlistsAsync = window.getRecentPlaylists();
</script>

<Sidebar />

<main>
  <h2>Recent</h2>
  {#await playlistsAsync then playlists}
    <PlaylistSelector {playlists} />
  {/await}
</main>

<style>
</style>
