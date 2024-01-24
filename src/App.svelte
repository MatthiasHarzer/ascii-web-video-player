<script lang="ts">

    import VideoPlayer from "./lib/VideoPlayer.svelte";

    const url = new URL(window.location.href);
    let video = url.searchParams.get("video");

    if (!video) {
        window.location.href = "/?video=never_gonna_give_you_up";
        video = "never_gonna_give_you_up";
    }



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
