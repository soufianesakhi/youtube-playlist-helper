<script lang="ts">
  import { replace } from "svelte-spa-router";
  import { flip } from "svelte/animate";
  import { expoOut } from "svelte/easing";
  import FloatingButton from "./FloatingButton.svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import ClipboardMultiple from "./icons/ClipboardMultiple.svelte";
  import CloseIcon from "./icons/CloseIcon.svelte";
  import PencilIcon from "./icons/PencilIcon.svelte";
  import PlaylistPlayIcon from "./icons/PlaylistPlayIcon.svelte";
  import PlaylistPlusIcon from "./icons/PlaylistPlusIcon.svelte";
  import PlusMultiple from "./icons/PlusMultiple.svelte";
  import ReverseIcon from "./icons/ReverseIcon.svelte";
  import SaveIcon from "./icons/SaveIcon.svelte";
  import LoadingModal from "./LoadingModal.svelte";
  import Modal from "./Modal.svelte";
  import PlaylistVideo from "./PlaylistVideo.svelte";
  import Sidebar from "./Sidebar.svelte";
  import SimpleButton from "./SimpleButton.svelte";

  enum ModalType {
    Export,
    Import,
  }

  export let editingTitle = false;
  export let playlist: Playlist = history.state.playlist;
  if (!playlist) {
    replace("/");
  }
  const previousPage = (history.state && history.state.previousPage) || "/";
  const isNew = location.hash.startsWith("#/new");

  let loading = true;
  let videos = [];
  Promise.all(playlist.videos.map((id) => window.fetchVideo(id))).then(
    (loadedVideos) => {
      videos = [...loadedVideos];
      if (videos.length > 0) {
        const ids = videos
          .map((v) => parseInt(v.id as string))
          .filter((n) => !isNaN(n));
        if (ids.length > 0) {
          window.videoIdCount = Math.max(...ids) + 1;
        }
      }
      loading = false;
    }
  );
  let hovering = -1;
  let originalTitle: string;

  let displayModal = false;
  let modalType: ModalType;
  let importText = "";
  let exportText = "";
  let notificationText = "";
  let exportTextArea: HTMLTextAreaElement;

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

  async function importVideos() {
    loading = true;
    let importedVideos = await Promise.all(
      window.parseYoutubeIds(importText).map((id) => window.fetchVideo(id))
    );
    importedVideos = importedVideos.filter((v) => v != null);
    videos = [...videos, ...importedVideos];
    importText = "";
    displayModal = false;
    loading = false;
    setTimeout(() => alert(`Imported ${importedVideos.length} videos`), 100);
  }

  async function exportVideos() {
    exportTextArea.select();
    exportTextArea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    notificationText = "Copied !";
    setTimeout(() => (notificationText = ""), 2000);
  }

  async function displayImport() {
    displayModal = true;
    modalType = ModalType.Import;
  }

  function displayExport() {
    displayModal = true;
    exportText = videos.map((v) => v.url).join("\n");
    modalType = ModalType.Export;
  }

  async function reversePlaylist() {
    let reversed = new Array(videos.length);
    for (let i = 0; i < videos.length; i++) {
      let r = videos.length - i - 1;
      reversed[i] = videos[r];
    }
    videos = reversed;
  }

  async function savePlaylist() {
    const videoIds = videos.map((video) => video.videoId.toString());
    playlist = { ...playlist, videos: videoIds };
    const id = await window.savePlaylist(playlist);
    playlist = { ...playlist, id };
    alert("Playlist saved");
    await replace("/saved");
  }
  async function deletePlaylist() {
    if (confirm("The playlist is about to be deleted")) {
      await window.removePlaylist(playlist);
      setTimeout(() => alert("Playlist deleted"), 100);
      window.history.state;
      await replace(previousPage);
    }
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
  const customFlip: typeof flip = (node, animation, _) => {
    return flip(node, animation, {
      duration: 1000,
      easing: expoOut,
    });
  };
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
  {#if !loading}
    <div class="platlist-btns">
      {#if videos.length > 0}
        <FloatingButton on:click={play} title="Play all videos"
          ><PlaylistPlayIcon /></FloatingButton
        >
      {/if}
      <FloatingButton on:click={addVideo} title="Add video"
        ><PlaylistPlusIcon /></FloatingButton
      >
      <FloatingButton on:click={displayImport} title="Import videos"
        ><PlusMultiple /></FloatingButton
      >
      {#if videos.length > 0}
        <FloatingButton on:click={displayExport} title="Export videos"
          ><ClipboardMultiple /></FloatingButton
        >
        {#if videos.length > 1}
          <FloatingButton on:click={reversePlaylist} title="Reverse order"
            ><ReverseIcon /></FloatingButton
          >
        {/if}
        <FloatingButton
          on:click={savePlaylist}
          title="Save the playlist"
          bgcolor="#28a745"><SaveIcon /></FloatingButton
        >
      {/if}
      {#if !isNew}
        <FloatingButton
          on:click={deletePlaylist}
          title="Delete the playlist"
          bgcolor="#dc3545"><CloseIcon /></FloatingButton
        >
      {/if}
    </div>
    <div class="list">
      {#each videos as video, index (video.id)}
        <div
          animate:customFlip
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
  {/if}
</main>

<Modal bind:display={displayModal}>
  {#if modalType === ModalType.Export}
    <!-- prettier-ignore -->
    <textarea bind:value={exportText} bind:this={exportTextArea}/>
    <FloatingButton on:click={exportVideos} title="Copy to clipboard"
      ><ClipboardMultiple /></FloatingButton
    >
    <span style="margin-left: 1rem">{notificationText}</span>
  {:else if modalType === ModalType.Import}
    <textarea bind:value={importText} />
    <FloatingButton on:click={importVideos} title="Import videos"
      ><PlusMultiple /></FloatingButton
    >
  {/if}
</Modal>

{#if loading}
  <LoadingModal />
{/if}

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

  textarea {
    min-width: 30rem;
    height: 50vh;
  }

  :global(textarea + *) {
    margin-left: 1rem;
  }
</style>
