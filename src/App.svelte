<script lang="ts">
    import githubLogo from "./assets/github.svg";
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

    <div class="git-ref">
        Check out this project on <a href="https://github.com/MatthiasHarzer/ascii-web-video-player">GitHub
        <img src={githubLogo} alt="GitHub Logo">
    </a>

    </div>
</main>

<style>
    a {
        font-weight: 500;
        color: #646cff;
        text-decoration: inherit;
    }
    a:hover {
        color: #535bf2;
    }
    .git-ref{
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 10px;
        font-weight: 500;
    }

    .git-ref img{
        height: 1.2em;
        position: relative;
        top: 0.2em;
    }

</style>
