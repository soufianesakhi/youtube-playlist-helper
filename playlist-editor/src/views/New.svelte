<script lang="ts">
  import PlaylistEditor from "../components/PlaylistEditor.svelte";

  async function newPLaylist() {
    let playlist = await window.videoService.generatePlaylist();
    return { ...playlist, title: "Playlist title" };
  }
  const playlistAsync = newPLaylist();
</script>

{#await playlistAsync then playlist}
  <PlaylistEditor {playlist} editingTitle={true} />
{/await}

<style>
</style>
