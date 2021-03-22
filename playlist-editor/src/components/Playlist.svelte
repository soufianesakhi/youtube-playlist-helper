<script lang="ts">
  import { flip } from "svelte/animate";
  import PlaylistVideo from "./PlaylistVideo.svelte";

  let playlistVideos: Video[] = [
    {
      id: "1",
      url: "https://www.youtube.com/watch?v=r_0JjYUe5jo",
      title: "Eminem - Godzilla ft. Juice WRLD (Directed by Cole Bennett)",
      channel: "Lyrical Lemonade",
      thumbnailUrl: "https://i.ytimg.com/vi/r_0JjYUe5jo/default.jpg",
    },
    {
      id: "2",
      url: "https://www.youtube.com/watch?v=dqRZDebPIGs",
      title: "The Weeknd - In Your Eyes (Official Video)",
      channel: "The Weeknd",
      thumbnailUrl:
        "https://i.ytimg.com/vi/dqRZDebPIGs/hqdefault.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAPGa3c_An8XFelSeXVREoBJc4spg",
    },
  ];
  let hovering = -1;

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    const newPlaylistVideos = playlistVideos;

    if (start < target) {
      newPlaylistVideos.splice(target + 1, 0, newPlaylistVideos[start]);
      newPlaylistVideos.splice(start, 1);
    } else {
      newPlaylistVideos.splice(target, 0, newPlaylistVideos[start]);
      newPlaylistVideos.splice(start + 1, 1);
    }
    playlistVideos = newPlaylistVideos;
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
  {#each playlistVideos as video, index (video.id)}
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
