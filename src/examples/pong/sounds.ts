import { playSFX } from '../../engine/vectorengine';

enum WAVE {
  SQUARE = 0,
  TRIANGLE = 1,
  SAWTOOTH = 2,
  SINE = 3,
  NOISE = 4
}

enum SLIDE {
  NONE = 0,
  LINNEAR = 1,
  EXPONENT = 2
}

@inline export function bounceSound(): void {
  playSFX(WAVE.SINE, 500, 10, 0, 0, 0.03,
    0, 0, WAVE.SINE, 0, 0, 0, 0, 0, 0.01, 0.05,
    1, 0, 0, 0, 0, 1, 0, 0, SLIDE.NONE);
}

@inline export function lostSound(): void {
  playSFX(WAVE.SQUARE, 1108, 783,
    0, 0, 0,
    0, 0, WAVE.SQUARE,
    0, 0, 1046,
    0.001, 0.001, 0.155126, 0.444629,
    1.240659, 0.0578727, 0.120870,
    0, 0, 1.0,
    0, 0, SLIDE.NONE);
}


@inline export function wonSound(): void {
  playSFX(WAVE.SQUARE, 783, 1108,
    0, 0, 0,
    0, 0, WAVE.SQUARE,
    0, 0, 1046,
    0.001, 0.001, 0.155126, 0.444629,
    1.240659, 0.0578727, 0.120870,
    0, 0, 1.0,
    0, 0, SLIDE.NONE);
}
/*
playSFX(wave_type: i32, freq: i32, freq_slide: i32,
  delay_freq_start_time_pct: f32, delay_freq_mult: f32, vibrato_time: f32,
  vibrato_shift_time: f32, vibrato_freq: i32, vibrato_wave_type: i32,
  low_pass_freq: i32, low_pass_freq_ramp: i32, high_pass_freq: i32,
  attack_time: f32, decay_time: f32, sustain_time: f32, release_time: f32,
  attack_punch_volume: f32, duty_cycle_len: f32, duty_cycle_pct: f32,
  flange_delay_time: f32, flange_feedback_volume: f32, gain: f32,
  noise_detune: i32, noise_detune_slide: i32, slide_type: i32): void;
*/