<script lang="ts">
  function isActive(...pages: string[]) {
    return pages.some(
      (page) =>
        location.href.endsWith(page) || location.href.endsWith(page + "/")
    );
  }
</script>

<div class="sidenav">
  <a href="#/saved" class:active={isActive("saved")}>Saved playlists</a>
  <a href="#/new" class:active={isActive("new")}>New playlist</a>
  <a href="#/manage" class:active={isActive("manage")}>Manage playlists</a>
  <a href="#/support" class:active={isActive("support")}>Support</a>
</div>

<style>
  .sidenav {
    height: 100%;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: var(--sidebar-bg-color);
    padding: 1rem 0.2rem;
  }

  .sidenav a {
    padding: 1rem 0.5rem;
    margin-bottom: 0.2rem;
    text-decoration: none;
    font-size: 1.2rem;
    line-height: 1.2rem;
    color: var(--sidebar-text-color);
    display: block;
  }

  .sidenav a:hover {
    background-color: var(--hover-color);
  }

  .sidenav a.active {
    background-color: var(--active-bg-color);
    color: var(--active-text-color);
  }

  .sidenav a:hover,
  .sidenav a.active {
    border-radius: 0.5rem;
  }
</style>
