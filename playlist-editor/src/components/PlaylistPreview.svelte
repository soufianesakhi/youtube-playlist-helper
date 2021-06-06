<script lang="ts">
  export let playlist: Playlist;
  const videos = playlist.loadedVideos;

  async function previewClicked() {
    window.openPlaylistEditor(playlist);
  }
</script>

<div class="preview" on:click|preventDefault={previewClicked}>
  <div class="preview-row">
    <img
      class="preview-img"
      alt={videos[0]?.title}
      src={videos[0]?.thumbnailUrl}
    />
    <img
      class="preview-img"
      alt={videos[1]?.title}
      src={videos[1]?.thumbnailUrl}
    />
  </div>
  <div class="preview-row">
    <img
      class="preview-img"
      alt={videos[2]?.title}
      src={videos[2]?.thumbnailUrl}
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
    width: 160px;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
</style>
