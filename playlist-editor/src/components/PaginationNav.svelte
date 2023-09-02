<script>
  import { PaginationNav } from "svelte-paginate";
</script>

<div class="custom-pagination-nav">
  <PaginationNav {...$$props} on:setPage />
</div>

<style>
  .custom-pagination-nav :global(.pagination-nav) {
    display: flex;
    justify-content: center;
    background: var(--background-color);
    border-radius: 3px;
    box-shadow: 0 1px 2px var(--shadow-color);
  }
  .custom-pagination-nav :global(.option) {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s all ease-out;
    user-select: none;
    color: var(--text-color);
  }

  .custom-pagination-nav :global(.option.number),
  .custom-pagination-nav :global(.option.ellipsis) {
    padding: 10px 15px;
  }
  .custom-pagination-nav :global(.option:hover) {
    background: var(--hover-color);
    cursor: pointer;
  }
  .custom-pagination-nav :global(.option.active) {
    color: hsl(200, 70%, 50%);
  }

  :global([data-theme="dark"]) .custom-pagination-nav :global(.option.prev svg),
  :global([data-theme="dark"])
    .custom-pagination-nav
    :global(.option.next svg) {
    filter: invert();
  }
</style>
