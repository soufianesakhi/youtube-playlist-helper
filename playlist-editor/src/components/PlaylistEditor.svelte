<script lang="ts">
  import { flip } from "svelte/animate";
  import FloatingButton from "./FloatingButton.svelte";
  import PlaylistPlusIcon from "./icons/PlaylistPlusIcon.svelte";
  import PlaylistVideo from "./PlaylistVideo.svelte";
  import Sidebar from "./Sidebar.svelte";

  const playlist: Playlist = history.state.playlist;
  let videos: Video[] = playlist.videos as Video[];
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

  async function deleteVideo(event: CustomEvent<Video>) {
    videos = videos.filter((video) => video.id !== event.detail.id);
  }

  async function addVideo() {
    const url = prompt("YouTube url");
    if (!url) {
      return;
    }
    const videoId = window.parseYoutubeId(url);
    if (videoId) {
      const video = await window.fetchVideo(videoId);
      videos = [...videos, video];
    } else {
      alert("Invalid YouTube url");
    }
  }
</script>

<Sidebar />

<main>
  <div class="platlist-btns">
    <FloatingButton on:click={addVideo}><PlaylistPlusIcon /></FloatingButton>
  </div>
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
        <PlaylistVideo
          on:delete={deleteVideo}
          {video}
          active={hovering === index}
        />
      </div>
    {:else}
      <p style="text-align: center">The playlist is empty</p>
    {/each}
  </div>
</main>

<style>
  .platlist-btns {
    padding: 20px;
  }

  .list {
    width: 100%;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  }

  .list > div:not(:last-child) {
    border-bottom: 1px solid #dbdbdb;
  }
</style>
