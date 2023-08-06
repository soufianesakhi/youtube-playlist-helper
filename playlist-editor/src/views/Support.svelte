<script lang="ts">
  import LargeButton from "../components/LargeButton.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import MailIcon from "../components/icons/MailIcon.svelte";
  import PayPalIcon from "../components/icons/PayPalIcon.svelte";

  function openLink(link) {
    window.open(link, "_blank");
  }
  function openSupportMail() {
    openLink(
      "mailto:soufiane.sakhi.js@gmail.com?subject=YouTube Playlist Helper request"
    );
  }
  function donate() {
    openLink("https://www.paypal.com/donate/?hosted_button_id=DXRGUUALQDKXW");
  }
</script>

<Sidebar />

<main>
  <div>
    <LargeButton on:click={openSupportMail}>
      <MailIcon />Send an email
    </LargeButton>
    if you have any request or suggestions.
  </div>

  <div>
    <LargeButton
      on:click={donate}
      style="background-color: #ffcc00; font-weight: bold;"
    >
      <PayPalIcon />Donate
    </LargeButton>
    to support the development costs of this extension.
  </div>
</main>

<style>
  main {
    padding: 5rem;
    font-size: 1.25rem;
  }
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
