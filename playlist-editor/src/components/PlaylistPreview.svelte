<script lang="ts">
  import { navigate } from "svelte-routing";

  export let playlist: Playlist;

  function previewClicked() {
    navigate("/editor", { state: { playlist } });
  }
</script>

<div class="preview" on:click|preventDefault={previewClicked}>
  <img alt={playlist.videos[0].title} src={playlist.videos[0].thumbnailUrl} />
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

  img {
    width: 120px;
    height: 65px;
    object-fit: cover;
  }

  .preview-title {
    font-weight: bold;
  }
</style>
