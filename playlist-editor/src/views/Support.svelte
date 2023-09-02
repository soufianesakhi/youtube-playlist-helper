<script lang="ts">
  import Fa from "svelte-fa";
  import LargeButton from "../components/LargeButton.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import PayPalIcon from "../components/icons/PayPalIcon.svelte";
  import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

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
      <Fa icon={faEnvelope} />
      Send an email
    </LargeButton>
    if you have any request or suggestions. I will try to respond when I have the
    time.
  </div>

  <div>
    <LargeButton
      on:click={donate}
      style="background-color: #ffcc00; color: black; font-weight: bold;"
    >
      <PayPalIcon />Donate
    </LargeButton>
    to support the development costs of this extension.
  </div>
</main>

<style>
  main {
    height: 50%;
    padding: 5rem;
    font-size: 1.25rem;
    gap: 2rem;
  }
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
