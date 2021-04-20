<script lang="ts">
  import { flip } from "svelte/animate";
  import FloatingButton from "./FloatingButton.svelte";
  import PlaylistPlusIcon from "./icons/PlaylistPlusIcon.svelte";
  import PlaylistVideo from "./PlaylistVideo.svelte";
  import Sidebar from "./Sidebar.svelte";

  export let location;
  const playlist: Playlist = location?.state?.playlist || {
    id: 1,
    title: new Date().toLocaleString(),
    videos: [
      {
        id: "1",
        videoId: "r_0JjYUe5jo",
        url: "https://www.youtube.com/watch?v=r_0JjYUe5jo",
        title: "Eminem - Godzilla ft. Juice WRLD (Directed by Cole Bennett)",
        channel: "Lyrical Lemonade",
        thumbnailUrl: "https://i.ytimg.com/vi/r_0JjYUe5jo/default.jpg",
      },
      {
        id: "2",
        videoId: "dqRZDebPIGs",
        url: "https://www.youtube.com/watch?v=dqRZDebPIGs",
        title: "The Weeknd - In Your Eyes (Official Video)",
        channel: "The Weeknd",
        thumbnailUrl: "https://i.ytimg.com/vi/dqRZDebPIGs/default.jpg",
      },
      {
        id: "3",
        videoId: "dmDbS5LyiZ0",
        url: "https://www.youtube.com/watch?v=dmDbS5LyiZ0",
        title:
          "Blinding Lights - The Weeknd (Boyce Avenue acoustic cover) on Spotify & Apple",
        channel: "Boyce Avenue",
        thumbnailUrl: "https://i.ytimg.com/vi/dmDbS5LyiZ0/default.jpg",
      },
    ],
    timestamp: Date.now(),
  };
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
