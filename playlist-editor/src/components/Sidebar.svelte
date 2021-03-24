<script>
  import { links } from "svelte-routing";

  let basepath = globalThis.basePath;
</script>

<div class="sidenav" use:links>
  <a href="{basepath}/recent">Recently created playlists</a>
  <a href="{basepath}/new">New playlist</a>
  <a href="{basepath}/saved">Saved playlists</a>
</div>

<style>
  .sidenav {
    height: 100%;
    width: 20vw;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: rgb(255, 82, 82);
    overflow-x: hidden;
    padding-top: 1rem;
  }

  .sidenav a {
    padding: 6px 8px 6px 16px;
    text-decoration: none;
    font-size: 1rem;
    line-height: 1rem;
    color: #ffffff;
    display: block;
  }

  .sidenav a:hover {
    color: #c7c7c7;
  }
</style>
