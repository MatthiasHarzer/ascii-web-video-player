const API_SERVER = import.meta.env.VITE_API_SERVER as string;

interface AsciiVideoServerBaseResponse {
    fps: number;
    original_width: number;
    original_height: number;
}

export interface AsciiVideoInfoResponse extends AsciiVideoServerBaseResponse {
    frames_count: number;
}

export interface AsciiVideoFrameResponse extends AsciiVideoServerBaseResponse {
    frames: Frames
}

export interface Frames {
    [key: number]: string;
}

const PRELOAD_SECONDS = 5;

export class AsciiVideoClient {

    filename: string;
    reference_id: string | undefined;
    frames: Frames = {};
    frame_position: number = 0;
    total_frame_count: number = 0;
    completed: boolean = false;
    loading_promise: Promise<void> | undefined;
    info: AsciiVideoInfoResponse | undefined;

    get fps(){
        return this.info?.fps || 0;
    }

    constructor(filename: string) {
        this.filename = filename;
        this.reference_id = undefined;

    }

    preloaded_frames_count(frame_position: number): number {
        if (!this.frames[frame_position]) {
            return 0;
        }

        let number_of_preloaded_frames = 0;

        for (let i = frame_position; i < this.total_frame_count; i++) {
            if (!this.frames[i]) {
                return number_of_preloaded_frames;
            } else {
                number_of_preloaded_frames++;
            }
        }

        return 0;
    }

    async init(): Promise<void> {
        this.info = await this.get_info();
        this.total_frame_count = this.info.frames_count;
        await this.load_frames(0, this.info.fps * PRELOAD_SECONDS);
    }

    async get_info(): Promise<AsciiVideoInfoResponse> {
        const response = await fetch(`${API_SERVER}/files/${this.filename}/info`);
        return await response.json();
    }


    get_last_loaded_frame_position(frame_position: number): number {
        let next_frame_position = frame_position;

        for(let i = frame_position; i < this.total_frame_count; i++) {
            if (!this.frames[i]) {
                return next_frame_position;
            } else {
                next_frame_position++;
            }
        }

        return next_frame_position;
    }

    async load_frames(frame_position: number, frames_count: number): Promise<void> {
        if (this.loading_promise) {
            return this.loading_promise;
            // await this.loading_promise;
        }
        if (this.completed) {
            return;
        }

        return new Promise((res) => {
            this.loading_promise = new Promise(async (resolve) => {
                const response = await this.fetch_frames(frame_position, frames_count);

                const finish = () =>{
                    this.loading_promise = undefined;
                    res();
                    resolve();
                }

                if (Object.keys(response.frames).length === 0) {
                    this.completed = true;
                    finish();
                    return;
                }

                for (const entry of Object.entries(response.frames)) {
                    this.frames[parseInt(entry[0])] = entry[1];
                }
                finish();
            });
        })
    }

    async get_next_frames(frame_position: number, frames_count: number): Promise<Frames> {
        if (this.completed) {
            return [];
        }

        const effective_frame_pos = this.get_last_loaded_frame_position(frame_position);
        const num_preloaded_frames = this.preloaded_frames_count(frame_position);
        const target_preloaded_frames = this.fps * PRELOAD_SECONDS + frames_count;

        if (num_preloaded_frames < frames_count) {
            await this.loading_promise;
        }

        if (num_preloaded_frames < target_preloaded_frames) {
            this.load_frames(effective_frame_pos, target_preloaded_frames);
        }

        const frames: Frames = {};
        for (let i = frame_position; i < frame_position + frames_count; i++) {
            frames[i] = this.frames[i];
        }
        return frames;
    }

    async fetch_frames(frame_position: number, frames_count: number): Promise<AsciiVideoFrameResponse> {
        let url = `${API_SERVER}/files/${this.filename}?start_frame=${frame_position}&frames=${frames_count}`;
        const response = await fetch(url);
        return await response.json();
    }
}
