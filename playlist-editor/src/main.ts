import App from "./App.svelte";
import { initTheme } from "./stores/theme.store.js";

if (!window.savePlaylist) {
  import("./services/storage-service");
  import("./services/video-service");
  import("./services/utils");
}

const app = new App({
  target: document.body,
});

initTheme();

export default app;
