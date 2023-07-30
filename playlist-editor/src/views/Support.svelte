<script lang="ts">
  import Sidebar from "../components/Sidebar.svelte";
</script>

<Sidebar />

<main>
  <p>
    Send me an <a
      href="mailto:soufiane.sakhi.js@gmail.com?subject=YouTube Playlist Helper request"
      >email</a
    > if you have any request or suggestions.
  </p>

  <div>
    <a href="https://www.paypal.com/donate/?hosted_button_id=DXRGUUALQDKXW">
      <img
        src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
        alt="Donate"
      />
    </a> to support the development costs of this extension.
  </div>
</main>

<style>
  main {
    padding: 5rem;
  }
  div {
    display: flex;
    align-items: center;
  }
  img {
    margin-right: 0.5rem;
  }
</style>
