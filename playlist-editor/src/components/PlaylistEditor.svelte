<script lang="ts">
  import { flip } from "svelte/animate";
  import PlaylistVideo from "./PlaylistVideo.svelte";

  export let location;
  const playlist: Playlist = location.state.playlist;
  let videos: Video[] = playlist.videos;
  let hovering = -1;

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    const newPlaylistVideos = videos;

    if (start < target) {
      newPlaylistVideos.splice(target + 1, 0, newPlaylistVideos[start]);
      newPlaylistVideos.splice(start, 1);
    } else {
      newPlaylistVideos.splice(target, 0, newPlaylistVideos[start]);
      newPlaylistVideos.splice(start + 1, 1);
    }
    videos = newPlaylistVideos;
    hovering = -1;
  };

  const dragstart = (event, i) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    const start = i;
    event.dataTransfer.setData("text/plain", start);
  };
</script>

<div class="list">
  {#each videos as video, index (video.id)}
    <div
      animate:flip
      draggable={true}
      on:dragstart={(event) => dragstart(event, index)}
      on:dragenter={() => (hovering = index)}
      on:dragover|preventDefault
      on:drop|preventDefault={(event) => drop(event, index)}
    >
      <PlaylistVideo {video} active={hovering === index} />
    </div>
  {/each}
</div>

<style>
  .list {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  }

  .list > div:not(:last-child) {
    border-bottom: 1px solid #dbdbdb;
  }
</style>
