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
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import RemoveDuplicates from "./icons/RemoveDuplicates.svelte";
  import type { Playlist, Video } from "../types/model.js";

  const videoService = window.videoService;

  enum ModalType {
    Export,
    Import,
  }

  export let editingTitle = false;
  export let playlist: Playlist = history.state?.playlist;
  const previousPage = history.state?.previousPage || "/";
  const isNew = location.hash.startsWith("#/new");
  const isPlaylistBuilder = location.hash.startsWith("#/playlist-builder");
  let loading = true;
  let dataLoaded = false;
  let videos = [] as Video[];

  async function loadPageVideos(page) {
    loading = true;
    let indicesToLoad = [];
    for (
      let videoIndex = (page - 1) * pageSize;
      videoIndex < page * pageSize && videoIndex < videos.length;
      videoIndex++
    ) {
      if (videos[videoIndex].title == "") {
        indicesToLoad.push(videoIndex);
      }
    }
    if (indicesToLoad.length > 0) {
      const videosToLoad = indicesToLoad.map(
        (videoIndex) => videos[videoIndex].videoId
      );
      console.debug("Loading videos", videosToLoad);
      const loadedVideos = await Promise.all(
        videosToLoad.map((videoId) => videoService.fetchVideo(videoId))
      );
      const videosUpdated = [...videos];
      loadedVideos.forEach(
        (loadedVideo, loadIndex) =>
          (videosUpdated[indicesToLoad[loadIndex]] = loadedVideo)
      );
      videos = [...videosUpdated];
    }
    loading = false;
  }

  const possiblePageSizes = [10, 20, 30, 40, 50];
  const defaultPageSize = 50;
  let currentPage = 1;
  let pageSize = defaultPageSize;
  $: paginatedVideos = paginate({
    items: videos,
    pageSize,
    currentPage,
  }) as Video[];

  async function updatePaginationPage(e) {
    currentPage = e.detail.page;
    await loadPageVideos(currentPage);
  }

  async function pageSizeChanged() {
    currentPage = 1;
    window.storeObject("page-size", pageSize);
    await loadPageVideos(currentPage);
  }

  (async function () {
    if (isPlaylistBuilder) {
      const videoIds = await browser.runtime.sendMessage({
        cmd: "get-playlist-builder",
      });
      playlist = await videoService.generatePlaylist(videoIds);
    } else {
      const url = new URL(document.URL);
      const id = url.searchParams.get("id");
      const saved = url.searchParams.get("saved");
      if (id) {
        if (saved) {
          playlist = await window.getPlaylist(id);
        } else {
          playlist = await window.getRecentPlaylist(id);
        }
        history.replaceState({ playlist }, "", url.pathname + url.hash);
      } else {
        const videoIds = url.searchParams.get("videoIds");
        if (videoIds) {
          playlist = await videoService.generatePlaylist(videoIds.split(","));
          history.replaceState({ playlist }, "", url.pathname + url.hash);
        }
      }
    }
    if (!playlist) {
      replace("/");
      return;
    }

    pageSize = await window.fetchObject("page-size", defaultPageSize);
    await Promise.all(
      playlist.videos.map((id) => videoService.fetchVideo(id, true))
    ).then(async (loadedVideos) => {
      videos = [...loadedVideos];
      await loadPageVideos(currentPage);
      loading = false;
      dataLoaded = true;
    });
  })();

  let hovering = -1;
  let originalTitle: string;

  let displayModal = false;
  let modalType: ModalType;
  let importText = "";
  let exportText = "";
  let notificationText = "";
  let exportTextArea: HTMLTextAreaElement;

  let disableThumbnails = true;
  window.getSettings().then((settings) => {
    disableThumbnails = settings.disableThumbnails;
  });

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    target = (currentPage - 1) * pageSize + target;
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
    const start = (currentPage - 1) * pageSize + i;
    event.dataTransfer.setData("text/plain", start);
  };

  async function deleteVideo(event: CustomEvent<Video>) {
    videos = videos.filter((video) => video.id !== event.detail.id);
    if (paginatedVideos.length == 1 && currentPage > 1) {
      currentPage = currentPage - 1;
    }
    loadPageVideos(currentPage);
    await savePlaylistBuilder();
  }

  async function addVideo() {
    const url = prompt("YouTube url");
    if (!url) {
      return;
    }
    const videoId = videoService.parseYoutubeId(url);
    if (videoId) {
      const video = await videoService.fetchVideo(videoId);
      videos = [...videos, video];
      await savePlaylistBuilder();
    } else {
      alert("Invalid YouTube url");
    }
  }

  async function importVideos() {
    loading = true;
    let importedVideos = await Promise.all(
      videoService
        .parseYoutubeIds(importText)
        .map((id) => videoService.fetchVideo(id))
    );
    importedVideos = importedVideos.filter((v) => v != null);
    videos = [...videos, ...importedVideos];
    await savePlaylistBuilder();
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
    loadPageVideos(currentPage);
    await savePlaylistBuilder();
  }

  async function removeDuplicates() {
    const videosMap = videos.reduce((acc, video) => {
      const videoId = video.videoId.toString();
      if (!acc[videoId]) {
        acc[videoId] = video;
      }
      return acc;
    }, {} as Video[]);
    const uniqueVideos = Object.values(videosMap);

    const duplicatesCount = videos.length - uniqueVideos.length;
    if (duplicatesCount > 0) {
      videos = uniqueVideos;
      loadPageVideos(currentPage);
      await savePlaylistBuilder();
      setTimeout(() => alert(`Removed ${duplicatesCount} duplicates`), 200);
    } else {
      alert("No duplicates found");
    }
  }

  async function savePlaylist() {
    const videoIds = videos.map((video) => video.videoId.toString());
    playlist = { ...playlist, videos: videoIds };
    const id = await window.savePlaylist(playlist);
    playlist = { ...playlist, id };
    if (isPlaylistBuilder) {
      await browser.runtime.sendMessage({
        cmd: "clear-playlist-builder",
      });
    }
    alert("Playlist saved");
    await replace("/saved");
  }

  async function savePlaylistBuilder() {
    if (isPlaylistBuilder) {
      const videoIds = videos.map((video) => video.videoId.toString());
      await browser.runtime.sendMessage({
        cmd: "update-playlist-builder",
        playlistBuilder: videoIds,
      });
    }
  }

  async function clearPlaylistBuilder() {
    if (isPlaylistBuilder) {
      videos = [];
      await browser.runtime.sendMessage({
        cmd: "clear-playlist-builder",
      });
    }
  }

  async function deletePlaylist() {
    if (confirm("The playlist is about to be deleted")) {
      await window.removePlaylist(playlist);
      await replace(previousPage);
    }
  }

  function play() {
    const videoIds = videos.map((video) => video.videoId.toString());
    loading = true;
    videoService.openPlaylist(videoIds).finally(() => (loading = false));
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
      <div style="line-height: 40px;">{playlist?.title}</div>
      <SimpleButton className="edit-title-btn" on:click={startTitleEdit}>
        <PencilIcon />
      </SimpleButton>
    {:else}
      <input class="edit-title-input" type="text" bind:value={playlist.title} />
      <SimpleButton on:click={endTitleEdit}><CheckIcon /></SimpleButton>
      <SimpleButton on:click={resetTitle}><CloseIcon /></SimpleButton>
    {/if}
  </h2>
  {#if dataLoaded || !loading}
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
          <FloatingButton on:click={removeDuplicates} title="Remove duplicates"
            ><RemoveDuplicates /></FloatingButton
          >
        {/if}
        {#if isPlaylistBuilder}
          <FloatingButton
            on:click={clearPlaylistBuilder}
            title="Clear the playlist builder"
            bgcolor="#dc3545"><CloseIcon /></FloatingButton
          >
        {/if}
        <FloatingButton
          on:click={savePlaylist}
          title="Save the playlist"
          bgcolor="#28a745"><SaveIcon /></FloatingButton
        >
      {/if}
      {#if !isNew && !isPlaylistBuilder}
        <FloatingButton
          on:click={deletePlaylist}
          title="Delete the playlist"
          bgcolor="#dc3545"><CloseIcon /></FloatingButton
        >
      {/if}
    </div>
    <div class="list">
      {#each paginatedVideos as video, index (video.id)}
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
            {disableThumbnails}
            active={hovering === index}
          />
        </div>
      {:else}
        <p style="text-align: center">The playlist is empty</p>
      {/each}
      <div class="pagination">
        {#if videos.length > pageSize}
          <LightPaginationNav
            totalItems={videos.length}
            {pageSize}
            {currentPage}
            limit={1}
            showStepOptions={true}
            on:setPage={updatePaginationPage}
          />
        {:else if videos.length > 0}
          <span>Page size:</span>
        {/if}
        {#if videos.length > 0}
          <select bind:value={pageSize} on:change={pageSizeChanged}>
            {#each possiblePageSizes as size}
              <option value={size}>
                {size}
              </option>
            {/each}
          </select>
        {/if}
      </div>
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

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination select {
    margin: 0.5rem;
  }
</style>
