<script lang="ts">
  import PlaylistCount from "./PlaylistCount.svelte";

  const videoService = window.videoService;

  export let playlist: Playlist;
  export let disableThumbnails = false;
  const videos = playlist.videos;

  async function previewClicked() {
    videoService.openPlaylistEditor(playlist);
  }
</script>

<div class="preview" on:click|preventDefault={previewClicked}>
  {#if !disableThumbnails}
    <div class="preview-row">
      <img
        class="preview-img"
        alt=""
        src={videoService.getVideoThumbnailUrl(videos[0])}
      />
      <img
        class="preview-img"
        alt=""
        src={videoService.getVideoThumbnailUrl(videos[1])}
      />
    </div>
    <div class="preview-row">
      <img
        class="preview-img"
        alt=""
        src={videoService.getVideoThumbnailUrl(videos[2])}
      />
      <PlaylistCount {playlist} className="preview-img" />
    </div>
  {:else}
    <PlaylistCount {playlist} className="preview-count" />
  {/if}
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

  :global(.preview-img) {
    width: 80px;
    height: 45px;
    padding: 0;
    margin: 0;
    float: left;
  }

  :global(.preview-count) {
    width: 160px;
    height: 90px;
    font-size: 20px;
    padding: 0;
    margin: 0;
    float: left;
  }

  img {
    object-fit: cover;
  }

  .preview-title {
    font-weight: bold;
    width: 160px;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
</style>
