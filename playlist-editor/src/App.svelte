<script>
  import { Route, Router } from "svelte-routing";
  import New from "./views/New.svelte";
  import Recent from "./views/Recent.svelte";
  import Saved from "./views/Saved.svelte";

  export let url = "";
  let basepath = globalThis.basePath;
</script>

<Router {url} {basepath}>
  <Route path="/" component={Recent} />
  <Route path="recent" component={Recent} />
  <Route path="new" component={New} />
  <Route path="saved" component={Saved} />
</Router>
