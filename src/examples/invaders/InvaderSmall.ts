import { renderLoop } from "../../engine";
import { InvaderObj } from "./InvaderObj";

export class InvaderSmall extends InvaderObj {
  frame1: StaticArray<f32> = [
    0.125, 0.875, -0.125, 0.875,
    -0.75, 0.25, -0.75, 0,
    -0.5, -0.25, -0.75, -0.5,
    -0.375, -0.875, -0.25, -0.75,
    -0.53125, -0.5, -0.3125, -0.28125,
    -0.3125, -0.125, -0.25, -0.25,
    0.25, -0.25, 0.3125, -0.125,
    0.3125, -0.28125, 0.53125, -0.5,
    0.25, -0.75, 0.375, -0.875,
    0.75, -0.5, 0.5, -0.25,
    0.75, 0, 0.75, 0.25,];

  frame2: StaticArray<f32> = [
    0.125, 0.875, -0.125, 0.875,
    -0.75, 0.25, -0.75, 0,
    -0.5, -0.25, -0.953125, -0.703125,
    -0.953125, -0.875, -0.8125, -0.875,
    -0.8125, -0.75, -0.5625, -0.515625,
    -0.4375, -0.75, -0.4375, -0.875,
    -0.296875, -0.875, -0.296875, -0.75,
    -0.453125, -0.421875, -0.296875, -0.25,
    -0.125, -0.5, 0.125, -0.5,
    0.296875, -0.25, 0.453125, -0.421875,
    0.296875, -0.75, 0.296875, -0.875,
    0.4375, -0.875, 0.4375, -0.75,
    0.5625, -0.515625, 0.8125, -0.75,
    0.8125, -0.875, 0.953125, -0.875,
    0.953125, -0.703125, 0.5, -0.25,
    0.75, 0, 0.75, 0.25,];

  lefteye_layer: StaticArray<f32> = [-0.25, 0.5, -0.375, 0.375, -0.25, 0.25, -0.125, 0.375,];
  righteye_layer: StaticArray<f32> = [0.125, 0.375, 0.25, 0.5, 0.375, 0.375, 0.2578125, 0.2421875,];

  mouth_layer: StaticArray<f32> = [0.25, -0.125, -0.25, -0.125, -0.046875, -0.328125, 0.046875, -0.328125,];


  constructor() {
    super();
    this.hw = 0.95 * this._scale;
    this.hh = 0.875 * this._scale;
  }

  @inline render(): void {
    if (this.active == false) {
      return;
    }

    if (this.frame == 1) {
      renderLoop(this.frame1, this.x, this.y, this.color, 0.0, 0.05);
    }
    else {
      renderLoop(this.frame2, this.x, this.y, this.color, 0.0, 0.05);
      renderLoop(this.mouth_layer, this.x, this.y, this.color, 0.0, 0.05);
    }
    renderLoop(this.lefteye_layer, this.x, this.y, this.color, 0.0, 0.05);
    renderLoop(this.righteye_layer, this.x, this.y, this.color, 0.0, 0.05);
  }
}
