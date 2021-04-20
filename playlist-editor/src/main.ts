import App from "./App.svelte";

import("./services/video-service").catch((err) => console.error(err));

const app = new App({
  target: document.body,
});

export default app;
