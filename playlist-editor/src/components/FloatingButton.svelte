<script lang="ts">
  export let title = "";
  export let bgcolor = "#007bff";
</script>

<div class="fab" style="background-color: {bgcolor}" on:click>
  <slot />
  {#if !!title}
    <span class="tooltip" style="background-color: {bgcolor}">{title}</span>
  {/if}
</div>

<style>
  .fab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    line-height: 40px;
    color: white;
    border-radius: 50%;
    box-shadow: 0 6px 10px 0 var(--shadow-color);
    transition: all 0.1s ease-in-out;
    cursor: pointer;
  }

  .fab:hover {
    box-shadow: 0 6px 14px 0 var(--shadow-color);
    transform: scale(1.05);
  }

  .fab:hover .tooltip {
    visibility: visible;
  }

  .tooltip {
    visibility: hidden;
    width: 120px;
    opacity: 0.8;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    line-height: initial;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
  }
</style>
