<script lang="ts">
  import { navigate } from "svelte-routing";

  export let playlist: Playlist;
  let basepath = globalThis.basePath;

  function previewClicked() {
    navigate(`${basepath}/editor`, { state: { playlist } });
  }
</script>

<div class="preview" on:click|preventDefault={previewClicked}>
  <div class="preview-row">
    <img
      class="preview-img"
      alt={playlist.videos[0]?.title}
      src={playlist.videos[0]?.thumbnailUrl}
    />
    <img
      class="preview-img"
      alt={playlist.videos[1]?.title}
      src={playlist.videos[1]?.thumbnailUrl}
    />
  </div>
  <div class="preview-row">
    <img
      class="preview-img"
      alt={playlist.videos[2]?.title}
      src={playlist.videos[2]?.thumbnailUrl}
    />
    <div class="preview-img playlist-count">
      <span>({playlist.videos.length})</span>
    </div>
  </div>
  <span class="preview-title">{playlist.title}</span>
</div>

<style>
  .preview {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    padding: 10px;
  }

  .preview:hover {
    background-color: #eeeeee;
  }

  .preview-img {
    width: 80px;
    height: 45px;
    padding: 0;
    margin: 0;
    float: left;
  }

  img {
    object-fit: cover;
  }

  .playlist-count {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background-color: black;
    color: white;
  }

  .preview-title {
    font-weight: bold;
  }
</style>
