<script lang="ts">

    import {AsciiVideoClient, type AsciiVideoInfoResponse, type Frames} from "./ascii_video_client";

    export let filename: string;
    export let current_frame_id = 0;

    export let total_frames = 0;

    $: video_client = new AsciiVideoClient(filename);

    let frames: Frames = {};

    let frame_element: HTMLDivElement;
    let loading_frames = false;
    let interval_id: number;
    let playing = false;
    let video_info: AsciiVideoInfoResponse;
    let error: any = null;
    let frame_width: number | null = null;
    let line_height: number | null = null;
    let font_size: number = 10;

    $: total_frames = video_info?.frames_count;

    const determine_font_size = () => {
        if (frame_width == null || line_height == null) {
            return;
        }

        font_size = 20;
        const viewport_width = window.innerWidth - 50;
        const viewport_height = window.innerHeight + 30;
        const element = document.createElement("span");
        const sample_line = "0".repeat(frame_width);

        element.style.position = "static";
        element.style.fontSize = font_size + "px";
        element.style.fontFamily = "monospace";

        element.innerText = sample_line;

        document.body.appendChild(element);

        let {width, height} = element.getBoundingClientRect();

        while ((width > viewport_width || height > viewport_height) && font_size > 1) {
            font_size -= 1;

            element.style.fontSize = font_size + "px";
            const rect = element.getBoundingClientRect();

            width = rect.width;
            height = rect.height * line_height;
        }

        element.remove();
    }

    const play_video = async () => {

        if (!video_client || playing) {
            return;
        }

        determine_font_size();

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

        if (Object.keys(frames).length === 0) {
            return;
        }
        frame_width = frames[0].split("\n")[0].length;
        line_height = frames[0].split("\n").length;

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


    $: fps = video_info?.fps;
    $: frames_count = video_info?.frames_count;


    $: if (video_client) {
        init_video();
    }

    window.addEventListener("resize", determine_font_size);
</script>

<div class="main">

    {#if error}
        <div class="error">
            {error.message}
        </div>
    {:else}
        <div class="player">
            <div bind:this={frame_element} class="frame" style="--font-size: {font_size}px;">

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
        justify-content: center;
        align-items: center;
    }

    .player{
        width: auto;
    }

    .frame {
        font-family: monospace;
        /*font-size: 10px;*/
        font-size: var(--font-size);
        white-space: pre;
        height: 100%;
        width: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        line-height: 1;
        flex: 0 1 auto;
    }

    .video-nav {
        flex: 1 0 auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        /*width: 0;*/
    }

    .progress-bar {
        flex: 1 1 auto;
    }
</style>
