<script lang="ts">
  export let display = false;

  function handleModalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("modal")) {
      display = false;
    }
  }
</script>

{#if display}
  <div on:click={handleModalClick} class="modal">
    <div class="modal-content">
      <slot />
    </div>
  </div>
{/if}

<style>
  .modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fefefe;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }

  .modal:hover {
    cursor: pointer;
  }

  .modal-content:hover {
    cursor: auto;
  }
</style>
