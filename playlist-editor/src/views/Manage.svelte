<script lang="ts">
  import Fa from "svelte-fa";
  import {
    faFileExport,
    faFileImport,
    faTriangleExclamation,
  } from "@fortawesome/free-solid-svg-icons";
  import LargeButton from "../components/LargeButton.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import type { PlaylistExport } from "../types/model.js";

  function exportFile(content: string, filename?: string) {
    var textToSaveAsBlob = new Blob([content], { type: "application/json" });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var downloadLink = document.createElement("a");
    downloadLink.download = filename ? filename : "export.json";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function () {
      downloadLink.remove();
    };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  async function exportSavedPlaylists() {
    const playlists = await window.getPlaylists();
    const playlistsExports: PlaylistExport[] = playlists.map(
      ({ title, videos, timestamp }) => ({
        title,
        videos,
        timestamp,
      })
    );
    exportFile(JSON.stringify(playlistsExports), "saved-playlists.json");
  }
  async function removeSavedPlaylists() {
    if (confirm("All the saved playlists are about to be deleted")) {
      await window.removeSavedPlaylists();
      alert("All saved playlists were successfully removed");
    }
  }

  async function importSavedPlaylists() {
    const fileInput = document.getElementById(
      "ImportSavedPlaylists"
    ) as HTMLInputElement;
    fileInput.onchange = () => {
      let fr = new FileReader();
      fr.onload = async () => {
        try {
          let playlistsExport: PlaylistExport[] = JSON.parse(
            fr.result as string
          );
          await window.importPlaylists(playlistsExport);
          alert("The playlists were successfully imported");
        } catch (e) {
          console.log(e);
          alert("The file is incorrectly formatted");
        }
        fileInput.value = null;
      };
      const file = fileInput.files[0];
      fr.readAsText(file);
    };
    fileInput.click();
  }
</script>

<Sidebar />

<main style="padding: 5rem;">
  <LargeButton on:click={exportSavedPlaylists}>
    <Fa icon={faFileExport} />
    Export saved playlists
  </LargeButton>

  <LargeButton on:click={importSavedPlaylists} style="margin-top: 1rem;">
    <Fa icon={faFileImport} />
    Import saved playlists
  </LargeButton>

  <div class="spacer" />

  <LargeButton
    on:click={removeSavedPlaylists}
    style="margin-top: 1rem; color: black; background-color: #FF8080"
  >
    <Fa icon={faTriangleExclamation} />
    Delete all saved playlists
  </LargeButton>
</main>

<input id="ImportSavedPlaylists" style="visibility: hidden;" type="file" />

<style>
  main {
    height: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
  .spacer {
    flex-grow: 1;
  }
</style>
