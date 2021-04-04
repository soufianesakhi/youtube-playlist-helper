<div class="fab" on:click>
  <slot />
</div>

<style>
  .fab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    line-height: 40px;
    background-color: rgb(0, 107, 207);
    color: white;
    border-radius: 50%;
    box-shadow: 0 6px 10px 0 #666;
    transition: all 0.1s ease-in-out;
    cursor: pointer;
  }

  .fab:hover {
    box-shadow: 0 6px 14px 0 #666;
    transform: scale(1.05);
  }
</style>
