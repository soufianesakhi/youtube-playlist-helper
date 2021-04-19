import App from "./App.svelte";
import { initServices } from "./services/VideoService";

initServices();

const app = new App({
  target: document.body,
});

export default app;
