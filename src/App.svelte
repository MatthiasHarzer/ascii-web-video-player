<script lang="ts">
    import githubLogo from "./assets/github.svg";
    import VideoPlayer from "./lib/VideoPlayer.svelte";

    const url = new URL(window.location.href);
    let video = url.searchParams.get("video");
    let current_frame = parseInt(url.searchParams.get("frame") ?? "0") ?? 0;
    let total_frames = 0;

    if (!video) {
        window.location.href = "/?video=never_gonna_give_you_up";
        video = "never_gonna_give_you_up";
    }

    let copy_button_text = "Copy Link";
    const copy_link = () => {
        const link = `${window.location.origin}/?video=${video}&frame=${current_frame}`;
        navigator.clipboard.writeText(link);

        copy_button_text = "Copied!";
        setTimeout(() => {
            copy_button_text = "Copy Link";
        }, 1000);
    }





</script>

<main>
    {#if video}
        <VideoPlayer filename={video} bind:current_frame_id={current_frame} bind:total_frames/>
    {:else}
        <h1>Video not found</h1>
    {/if}

    <div class="frame-count">
        <button on:click={copy_link}>
            {copy_button_text}
        </button>
        <span>
            {current_frame + 1} / {total_frames}
        </span>

    </div>

    <div class="git-ref">
        Check out this project on <a href="https://github.com/MatthiasHarzer/ascii-web-video-player">GitHub
        <img src={githubLogo} alt="GitHub Logo">
    </a>

    </div>
</main>

<style>
    a {
        font-weight: 500;
        color: #7964ff;
        text-decoration: inherit;
    }
    a:hover {
        color: #7964ff;
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

    .frame-count{
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 10px;
        font-weight: 500;
    }
    .frame-count button{
        margin: 0;
        padding: 0;
        border-radius: 5px;
        background-color: transparent;
        color: #7964ff;
        font-weight: 700;
        font-size: 1em;
        border: none;
        cursor: pointer;
    }

    .frame-count span{
        font-family: monospace;
    }

</style>
