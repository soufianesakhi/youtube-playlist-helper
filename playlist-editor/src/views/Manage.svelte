<script lang="ts">
  import LargeButton from "../components/LargeButton.svelte";
  import Sidebar from "../components/Sidebar.svelte";

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
  <LargeButton on:click={exportSavedPlaylists}
    >Export saved playlists</LargeButton
  >
  <LargeButton on:click={importSavedPlaylists} style="margin-top: 1rem;"
    >Import saved playlists</LargeButton
  >
  <LargeButton on:click={removeSavedPlaylists} style="margin-top: 1rem;"
    >Delete all saved playlists</LargeButton
  >
</main>

<input id="ImportSavedPlaylists" style="visibility: hidden;" type="file" />

<style>
</style>
