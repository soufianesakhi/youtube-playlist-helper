<script lang="ts">
  import { links } from "svelte-routing";

  let basepath = globalThis.basePath;

  function isActive(...pages: string[]) {
    return pages.some((page) => location.href.endsWith(page));
  }
</script>

<div class="sidenav" use:links>
  <a href="{basepath}/recent" class:active={isActive("recent", basepath || "/")}
    >Recently created playlists</a
  >
  <a href="{basepath}/new" class:active={isActive("new")}>New playlist</a>
  <a href="{basepath}/saved" class:active={isActive("saved")}>Saved playlists</a
  >
</div>

<style>
  .sidenav {
    flex: 0 0 15rem;
    background-color: rgb(255, 82, 82);
    padding: 1rem 0.2rem;
  }

  .sidenav a {
    padding: 1rem 0.5rem;
    margin-bottom: 0.2rem;
    text-decoration: none;
    font-size: 1.2rem;
    line-height: 1.2rem;
    color: #ffffff;
    display: block;
  }

  .sidenav a:hover {
    background-color: rgb(255, 154, 154);
  }

  .sidenav a.active {
    background-color: rgb(255, 221, 221);
    color: rgb(74, 75, 105);
    box-shadow: inset 0px 0px 0.2rem #c1c1c1;
  }

  .sidenav a:hover,
  .sidenav a.active {
    border-radius: 0.5rem;
  }
</style>
