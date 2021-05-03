import { renderLoop } from "../../engine";
import { AnimatedObject } from "./AnimatedObject";
import { DELTA_S, MSG } from "./Game";

const FRAME_TIME: f32 = 0.5;

export class Bomb extends AnimatedObject {
  time: f32 = 0.0;
  color: u32 = 0xff_ff_ff_ff; // default layer color

  frame1: StaticArray<f32> = [
    0, -0.875, 0.375, -0.75, 0.625, -0.5,
    0.875, 0.25, 0.5, -0.125, 0.375, 0.5,
    0.25, -0.125, 0, 0.984375, -0.2421875, -0.1171875,
    -0.375, 0.5, -0.5, -0.125, -0.875, 0.25,
    -0.625, -0.5, -0.375, -0.75,];
  frame2: StaticArray<f32> = [
    0, -0.984375, 0.375, -0.75, 0.625, -0.5,
    0.75, 0.375, 0.375, -0.125, 0.25, 0.625,
    0.125, -0.125, 0, 0.984375, -0.125, -0.125,
    -0.25, 0.625, -0.375, -0.125, -0.75, 0.375,
    -0.5, -0.5, -0.375, -0.75,];

  constructor() {
    super();
    this._scale = 0.025;

    this.x = 0.0;
    this.y = 0.0;
    this.hw = this._scale;
    this.hh = this._scale;
    this._maxFrame = 1;
    this._frame = 0;
  }

  @inline move(): void {
    if (this.active == false) {
      return;
    }

    this.y -= 0.25 * DELTA_S;
    if (this.y < -1.0) {
      this.active = false;
    }

    this.time -= DELTA_S;
    if (this.time < 0.0) {
      this.nextFrame();
      this.time = FRAME_TIME;
    }
  }

  @inline render(): void {
    if (this.active == false) {
      return;
    }

    if (this._frame == 0) {
      renderLoop(this.frame1, this.x, this.y, 0xff_ff_00_ff, 0.0, this._scale)
    }
    else {
      renderLoop(this.frame2, this.x, this.y, 0xff_ff_00_ff, 0.0, this._scale)
    }
  }

}