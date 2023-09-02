import App from "./App.svelte";

if (!window.savePlaylist) {
  import("./services/storage-service");
  import("./services/video-service");
  import("./services/utils");
}

const app = new App({
  target: document.body,
});

export default app;
