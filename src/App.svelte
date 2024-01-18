<script lang="ts">

    import VideoPlayer from "./lib/VideoPlayer.svelte";

    const url = new URL(window.location.href);
    const video = url.searchParams.get("video");


</script>

<main>
    {#if video}
        <VideoPlayer filename={video}/>
    {:else}
        <h1>Video not found</h1>
    {/if}
</main>

<style>

</style>
