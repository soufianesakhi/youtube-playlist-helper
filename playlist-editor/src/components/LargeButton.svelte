<script lang="ts">
  export let bgcolor = "#007bff";
</script>

<button
  class={$$props.class}
  style={`background-color: ${bgcolor}; ` + $$props.style}
  on:click
>
  <slot />
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-shrink: 0;
    text-align: center;
    border-radius: 1rem;
    height: 2.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    cursor: pointer;
    margin: 0;
    border-color: transparent;
    color: white;
  }
  button:hover,
  button:active {
    background-image: linear-gradient(rgb(0 0 0/5%) 0 0);
  }
  button:active {
    animation: none;
    transform: scale(0.95);
  }
</style>
