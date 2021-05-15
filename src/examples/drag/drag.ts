import { Input, VectorEngine, ClickableGameObject, DisplayString, playSFX, renderLoop, GameObject, logi32 } from '../../engine/index';
import { RenderableObject } from '../../engine/RenderableObject';

export { VectorEngineExports } from '../../engine/index';
VectorEngine.init();

@inline function dropSound(): void {
  playSFX(3, // wave type
    50, // freq
    360, // freq slide
    0, // delay freq start
    0, // delay freq mult
    0, // vibrato time
    0, // vibrato shift
    0, // vibrato freq
    0, // vibrato type
    0,  // low pass
    0, // low ramp
    0, // hi pass
    0, // attack
    0, // decay
    0.02, // sustain
    0.04, // release
    1, // punch
    0, // duty len
    0, // duty pct
    0, // flange delay
    0, // flange feedback
    1, // gain
    -17, // noise detune 
    -50, // detune slide
    0); // slide type
}

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


class Dragable extends ClickableGameObject {
  color: u32 = white;
  default_layer: StaticArray<f32> = [
    -0.625, -0.875, 0.625, -0.875,
    0.625, -0.65625, 0.5, -0.625,
    0.875, 0.625, 0.296875, -0.125,
    0.375, 0.890625, 0, 0,
    -0.375, 0.875, -0.296875, -0.125,
    -0.875, 0.625, -0.5, -0.625,
    -0.625, -0.65625,];


  constructor(x: f32, y: f32, scale: f32) {
    super();
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  public mouseOverTest(x: f32, y: f32): bool {
    if (this.x > this.x - this.scale && this.x < this.x + this.scale &&
      this.y > this.y - this.scale && this.y < this.y + this.scale) {
      return true;
    }
    return false;
  }

  public onMouseDown(): void {
    this.mouseDown = true;
    this.color = yellow;
    clickSound();
  }

  public onMouseUp(): void {
    this.color = white;
    dropSound();
  }

  public render(): void {
    renderLoop(this.default_layer, this.x, this.y, this.color, 0.0, this.scale);
  }

  public move(): void {
    if (this.mouseDown == true) {
      this.x = Input.MouseX;
      this.y = Input.MouseY;
    }
  }

}

let time_count: i32 = 0;
let drag = new Dragable(0.0, 0.0, 0.05);

export function gameLoop(delta: i32): void {
  time_count += delta;
  //text.render();

  let x: i32 = 320 + <i32>(Input.MouseX * 320.0);
  let y: i32 = 320 - <i32>(Input.MouseY * 320.0);
}