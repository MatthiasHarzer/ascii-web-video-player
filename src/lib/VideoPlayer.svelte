<script lang="ts">

    import {AsciiVideoClient, type AsciiVideoInfoResponse, type Frames} from "./ascii_video_client";

    export let filename: string;

    $: video_client = new AsciiVideoClient(filename);

    let frames: Frames = {};
    let current_frame_id = 0;
    let frame_element: HTMLDivElement;
    let loading_frames = false;
    let interval_id: number;
    let playing = false;
    let error: any = null;

    const play_video = async () => {

        if (!video_client || playing) {
            return;
        }

        playing = true;

        let request_running = false;

        const request_next_frames = async () => {
            if (request_running) {
                loading_frames = true;
                return;
            }
            loading_frames = false;
            request_running = true;
            const new_frames = await video_client.get_next_frames(current_frame_id, fps);
            frames = {...frames, ...new_frames};
            request_running = false;
        }


        interval_id = setInterval(() => {
            if (current_frame_id >= video_client.total_frame_count) {
                stop_video();
                return;
            }

            if (!frames[current_frame_id]) {
                request_next_frames();
                return;
            }

            if (frame_element) {
                loading_frames = false;
                frame_element.innerText = frames[current_frame_id];
            }


            current_frame_id += 1
        }, 1_000 / fps)
    }

    const stop_video = () => {
        playing = false;
        clearInterval(interval_id);
    }

    const init_video = async () => {
        try {
            video_info = await video_client.get_info();
        } catch (e) {
            error = e;
            return;
        }
        const fps = video_info.fps;

        await video_client.init();

        frames = await video_client.get_next_frames(0, fps);

        play_video();
    }

    const toggle_play = () => {
        if (playing) {
            stop_video();
        } else {
            play_video();
        }
    }

    $: play_pause_button_text = playing ? "Pause" : "Play";

    let video_info: AsciiVideoInfoResponse;

    $: fps = video_info?.fps;
    $: frames_count = video_info?.frames_count;


    $: if (video_client) {
        init_video();
    }
</script>

<div class="main">

    {#if error}
        <div class="error">
            {error.message}
        </div>
    {:else}
        <div class="player">
            <div bind:this={frame_element} class="frame">

            </div>
            <div class="video-nav">
                <button on:click={toggle_play}>
                    {play_pause_button_text}
                </button>
                <input on:input={play_video} bind:value={current_frame_id} class="progress-bar" max="{frames_count}"
                       min="0" step="1" type="range"/>
            </div>
        </div>


        {#if loading_frames}
            <div class="loading">
                LOADING
            </div>
        {/if}
    {/if}
</div>

<style>
    .main {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .frame {
        font-family: monospace;
        font-size: 10px;
        white-space: pre;
        height: 100%;
        overflow: hidden;
        line-height: 1;
    }

    .video-nav {
        flex: 1 0 auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .progress-bar {
        flex: 1 1 auto;
    }
</style>
