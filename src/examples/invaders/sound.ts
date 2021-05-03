import { playSFX } from "../../engine";


@inline export function playUpSnd(): void {

  playSFX(1, // wave type
    65, // freq
    73, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    3, // vibrato type
    0,  // low pass
    0, // low ramp
    0, // hi pass
    0, // attack
    0, // decay
    0, // sustain
    0.11, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    5.3, // gain
    0, // noise detune 
    0, // detune slide
    1); // slide type


}

@inline export function playDownSnd(): void {

  playSFX(1, // wave type
    73, // freq
    65, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    3, // vibrato type
    0,  // low pass
    0, // low ramp
    0, // hi pass
    0, // attack
    0, // decay
    0, // sustain
    0.11, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    5.3, // gain
    0, // noise detune 
    0, // detune slide
    1); // slide type


}


@inline export function playKillSnd(): void {
  playSFX(4, // wave type
    587, // freq
    46, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    3, // vibrato type
    0,  // low pass
    0, // low ramp
    0, // hi pass
    0.001, // attack
    0.001, // decay
    0.008483400481624147, // sustain
    0.1330605599241579, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    1, // gain
    -19, // noise detune 
    -63, // detune slide
    1); // slide type

}


@inline export function playShotSnd(): void {

  playSFX(1, // wave type
    494, // freq
    370, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    3, // vibrato type
    0,  // low pass
    0, // low ramp
    494, // hi pass
    0, // attack
    0, // decay
    0.03, // sustain
    0.02, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    1, // gain
    0, // noise detune 
    0, // detune slide
    1); // slide type

}

@inline export function playDieSnd(): void {
  playSFX(4, // wave type
    587, // freq
    46, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    3, // vibrato type
    0,  // low pass
    0, // low ramp
    0, // hi pass
    0.001, // attack
    0.08907136442642614, // decay
    0.15081707538660977, // sustain
    0.398961512918194, // release
    3.5017429504855593, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    1, // gain
    0, // noise detune 
    -25, // detune slide
    1); // slide type
}