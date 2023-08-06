<button class={$$props.class} style={$$props.style} on:click>
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
  }
  button:hover {
    background-color: #f0f0f0;
  }
  button:active {
    animation: none;
    transform: scale(0.95);
  }
</style>
