<script lang="ts">
  export let playlist: Playlist;
  export let className = "";
</script>

<div class="playlist-count {className}">
  <span>({playlist.videos.length})</span>
</div>

<style>
  .playlist-count {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background-color: black;
    color: white;
  }
</style>
