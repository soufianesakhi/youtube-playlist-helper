import App from "./App.svelte";

if (!window.savePlaylist) {
  import("./services/storage-service");
  import("./services/video-service");
}

const app = new App({
  target: document.body,
});

export default app;
