<script lang="ts">
  export let video: Video;
  export let active: boolean;

  function videoClicked() {
    window.open(video.url, "_blank");
  }
</script>

<div
  class="playlist-video"
  class:is-active={active}
  on:click|preventDefault={videoClicked}
>
  <img alt={video.title} src={video.thumbnailUrl} />
  <div class="video-details">
    <span class="video-title">{video.title}</span>
    <span>{video.channel}</span>
  </div>
</div>

<style>
  .playlist-video {
    display: flex;
    padding: 0.5em 1em;
    cursor: pointer;
  }

  .playlist-video:hover {
    background-color: #eeeeee;
  }

  .playlist-video.is-active {
    background-color: #3273dc;
    color: #fff;
  }

  img {
    width: 120px;
    height: 65px;
    object-fit: cover;
  }

  .video-details {
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0.5em;
    font-size: 16px;
  }

  .video-details > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .video-title {
    font-weight: bold;
  }
</style>
