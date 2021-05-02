<script lang="ts">
  import { replace } from "svelte-spa-router";
  import { flip } from "svelte/animate";
  import FloatingButton from "./FloatingButton.svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import CloseIcon from "./icons/CloseIcon.svelte";
  import PencilIcon from "./icons/PencilIcon.svelte";
  import PlaylistPlayIcon from "./icons/PlaylistPlayIcon.svelte";
  import PlaylistPlusIcon from "./icons/PlaylistPlusIcon.svelte";
  import SaveIcon from "./icons/SaveIcon.svelte";
  import PlaylistVideo from "./PlaylistVideo.svelte";
  import Sidebar from "./Sidebar.svelte";
  import SimpleButton from "./SimpleButton.svelte";

  let playlist: Playlist = history.state.playlist;
  if (!playlist) {
    replace("/");
  }
  const nextPage = history.state.previousPage || "/";
  let videos: Video[] = playlist.videos as Video[];
  let hovering = -1;
  let originalTitle: string;
  let editingTitle = false;

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

  async function savePlaylist() {
    playlist = { ...playlist, videos };
    const id = await window.savePlaylist(playlist);
    playlist = { ...playlist, id };
    alert("Playlist saved");
    await replace(nextPage);
  }
  async function deletePlaylist() {
    await window.removePlaylist(playlist);
    alert("Playlist deleted");
    window.history.state;
    await replace(nextPage);
  }

  function play() {
    const videoIds = videos.map((video) => video.videoId.toString());
    window.openPlaylist(videoIds);
  }

  function startTitleEdit() {
    originalTitle = playlist.title;
    editingTitle = true;
  }
  function resetTitle() {
    playlist.title = originalTitle;
    endTitleEdit();
  }
  function endTitleEdit() {
    originalTitle = null;
    editingTitle = false;
  }
</script>

<Sidebar />

<main>
  <h2>
    {#if !editingTitle}
      <div style="line-height: 40px;">{playlist.title}</div>
      <SimpleButton className="edit-title-btn" on:click={startTitleEdit}>
        <PencilIcon />
      </SimpleButton>
    {:else}
      <input class="edit-title-input" type="text" bind:value={playlist.title} />
      <SimpleButton on:click={endTitleEdit}><CheckIcon /></SimpleButton>
      <SimpleButton on:click={resetTitle}><CloseIcon /></SimpleButton>
    {/if}
  </h2>
  <div class="platlist-btns">
    <FloatingButton on:click={play} title="Play all videos"
      ><PlaylistPlayIcon /></FloatingButton
    >
    <FloatingButton on:click={addVideo} title="Add video"
      ><PlaylistPlusIcon /></FloatingButton
    >
    <FloatingButton on:click={savePlaylist} title="Save the playlist"
      ><SaveIcon /></FloatingButton
    >
    <FloatingButton on:click={deletePlaylist} title="Delete the playlist"
      ><CloseIcon /></FloatingButton
    >
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
  h2 {
    display: flex;
    justify-content: center;
    width: 100%;
    font-size: 24px;
  }

  .edit-title-input {
    width: 100%;
    text-align: center;
    margin: 0;
    margin-right: 5px;
    padding: 0;
    font-weight: bold;
  }

  :global(.edit-title-btn) {
    margin-left: 20px;
  }

  .platlist-btns {
    display: flex;
    padding: 0px 20px 20px;
  }

  .platlist-btns > :global(*) {
    margin-left: 10px;
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
