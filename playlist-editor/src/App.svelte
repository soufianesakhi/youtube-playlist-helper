<script>
  import Router from "svelte-spa-router";
  import PlaylistEditor from "./components/PlaylistEditor.svelte";
  import New from "./views/New.svelte";
  import Recent from "./views/Recent.svelte";
  import Saved from "./views/Saved.svelte";
  import Manage from "./views/Manage.svelte";

  const routes = {
    "/": Recent,
    "/recent": Recent,
    "/new": New,
    "/saved": Saved,
    "/editor": PlaylistEditor,
    "/playlist-builder": PlaylistEditor,
    "/manage": Manage,
    "*": Recent,
  };
</script>

<Router {routes} />
