import { Input, VectorEngine, Button, DisplayString, playSFX, DisplayNum } from '../../engine/index';

export { VectorEngineExports } from '../../engine/index';
VectorEngine.init();

@inline function clickSound(): void {
  playSFX(4, // wave type
    698, // freq
    0, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    0, // vibrato type
    0,  // low pass
    0, // low ramp
    3112, // hi pass
    0, // attack
    0, // decay
    0, // sustain
    0.01, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    1, // gain
    7, // noise detune 
    44, // detune slide
    0); // slide type
}

const blue: u32 = 0x99_99_ff_ff;
const yellow: u32 = 0xff_ff_00_ff;
const white: u32 = 0xff_ff_ff_ff;

var text = new DisplayString("mouse up or down", 0.0, 0.3, 0.05, white);

var button = new Button("button test", 0.0, 0.0, 0.05, white, yellow, blue,
  (): void => { // on mouse down
    text.overwrite("mouse down");
    clickSound();
  },
  (): void => { // on mouse up
    text.overwrite("mouse up");
  }
);

let time_count: i32 = 0;

export function gameLoop(delta: i32): void {
  time_count += delta;
  //text.render();

  let x: i32 = 320 + <i32>(Input.MouseX * 320.0);
  let y: i32 = 320 - <i32>(Input.MouseY * 320.0);
}