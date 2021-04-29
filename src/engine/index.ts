import { Input } from "./Input";

export { Input, KEY } from "./Input";
export { Char } from "./Char";
export { DisplayNum } from "./DisplayNum";
export { DisplayString } from "./DisplayString";


export enum RENDER_TYPE {
	POINTS = 0x0000,
	LINES = 0x0001,
	LINE_LOOP = 0x0002,
	LINE_STRIP = 0x0003
}

@external("env", "logf32")
export declare function logf32(f: f32): void;

@external("env", "logi32")
export declare function logi32(i: i32): void;

@external("env", "playSFX")
export declare function playSFX(wave_type: i32, freq: i32, freq_slide: i32,
	delay_freq_start_time_pct: f32, delay_freq_mult: f32, vibrato_time: f32,
	vibrato_shift_time: f32, vibrato_freq: i32, vibrato_wave_type: i32,
	low_pass_freq: i32, low_pass_freq_ramp: i32, high_pass_freq: i32,
	attack_time: f32, decay_time: f32, sustain_time: f32, release_time: f32,
	attack_punch_volume: f32, duty_cycle_len: f32, duty_cycle_pct: f32,
	flange_delay_time: f32, flange_feedback_volume: f32, gain: f32,
	noise_detune: i32, noise_detune_slide: i32, slide_type: i32): void;

export declare const canvasWidth: i32;
export declare const canvasHeight: i32;

export declare var mouseX: i32;
export declare var mouseY: i32;

Input.canvasWidth = canvasWidth;
Input.canvasHeight = canvasHeight;

@inline export function renderLoop(data: StaticArray<f32>, x: f32, y: f32,
	color: u32 = 0xff_ff_ff_ff, rot: f32 = 0.0, scale: f32 = 1.0): void {
	renderLineData(changetype<usize>(data), data.length,
		x, y, rot, scale, color, RENDER_TYPE.LINE_LOOP);
}

@inline export function renderLine(data: StaticArray<f32>, x: f32, y: f32,
	color: u32 = 0xff_ff_ff_ff, rot: f32 = 0.0, scale: f32 = 1.0): void {
	renderLineData(changetype<usize>(data), data.length,
		x, y, rot, scale, color, RENDER_TYPE.LINE_STRIP);
}

@external("env", "renderLineData")
declare function renderLineData(line_data_pointer: usize, len: u32,
	x: f32, y: f32, rot: f32, scale: f32, color: u32, type: RENDER_TYPE): void;
