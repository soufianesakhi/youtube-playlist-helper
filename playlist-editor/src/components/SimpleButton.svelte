<script lang="ts">
  export let className = "";
</script>

<div class="btn {className}" on:click>
  <slot />
</div>

<style>
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;
    cursor: pointer;
  }

  .btn:hover {
    box-shadow: 0 6px 14px 0 var(--shadow-color);
  }
</style>
