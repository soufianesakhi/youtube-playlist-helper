import App from "./App.svelte";

import("./services/video-service");
import("./services/storage-service");

const app = new App({
  target: document.body,
});

export default app;
