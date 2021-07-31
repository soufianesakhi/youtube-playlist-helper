<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import DeleteIcon from "./icons/DeleteIcon.svelte";
  import SimpleButton from "./SimpleButton.svelte";

  export let video: Video;
  export let active: boolean;
  export let disableThumbnails = false;

  const dispatch = createEventDispatcher();

  function videoClicked() {
    window.open(video.url, "_blank");
  }

  function deleteVideo(_: Event) {
    dispatch("delete", video);
  }
</script>

<div class="playlist-video" class:is-active={active}>
  {#if !disableThumbnails}
    <img
      alt={video.title}
      src={video.thumbnailUrl}
      on:click|preventDefault={videoClicked}
    />
  {/if}
  <div class="video-details">
    <span class="video-title">{video.title}</span>
    <span>{video.channel}</span>
  </div>
  <div class="video-btns">
    <SimpleButton on:click={deleteVideo}><DeleteIcon /></SimpleButton>
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
    flex-grow: 1;
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
    width: 50vw;
  }

  .video-btns {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 10px;
  }
</style>
