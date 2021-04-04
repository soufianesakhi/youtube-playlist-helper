<script lang="ts">
  import PlaylistPreview from "./PlaylistPreview.svelte";

  const videos: Video[] = [
    {
      id: "1",
      url: "https://www.youtube.com/watch?v=r_0JjYUe5jo",
      title: "Eminem - Godzilla ft. Juice WRLD (Directed by Cole Bennett)",
      channel: "Lyrical Lemonade",
      thumbnailUrl: "https://i.ytimg.com/vi/r_0JjYUe5jo/default.jpg",
    },
    {
      id: "2",
      url: "https://www.youtube.com/watch?v=dqRZDebPIGs",
      title: "The Weeknd - In Your Eyes (Official Video)",
      channel: "The Weeknd",
      thumbnailUrl: "https://i.ytimg.com/vi/dqRZDebPIGs/default.jpg",
    },
    {
      id: "3",
      url: "https://www.youtube.com/watch?v=dmDbS5LyiZ0",
      title:
        "Blinding Lights - The Weeknd (Boyce Avenue acoustic cover) on Spotify & Apple",
      channel: "Boyce Avenue",
      thumbnailUrl: "https://i.ytimg.com/vi/dmDbS5LyiZ0/default.jpg",
    },
  ];
  let playlistsSample: Playlist[] = [];
  for (let i = 0; i < 6; i++) {
    const timestamp = Date.now() + i * 1000;
    playlistsSample.push({
      id: i.toString(),
      title: new Date(timestamp).toLocaleString(),
      videos,
      timestamp,
    });
  }

  export let playlists: Playlist[] = playlistsSample;
</script>

<div class="selector">
  {#each playlists as playlist (playlist.id)}
    <PlaylistPreview {playlist} />
  {/each}
</div>

<style>
  .selector {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 10px;
  }
</style>
