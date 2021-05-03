import { renderLoop, RENDER_TYPE } from '../../engine/index';
import { GameObject } from './GameObject';

const WHITE: u32 = 0xff_ff_ff_ff;
const RED: u32 = 0xff_00_00_ff;
const YELLOW: u32 = 0xff_ff_00_ff;
const TWO_PI: f32 = 6.28318;


export class Shot extends GameObject {
  //object_name_color: u32 = 0xff_00_ff_ff; // default layer color 0xff_00_00_ff; // inner layer color 0xff_ff_ff_ff; // center layer color
  private outer_layer: StaticArray<f32> = [
    0, 0.875, -0.1171875, 0.1171875, -0.875, 0,
    -0.125, -0.125, 0, -0.875, 0.125, -0.125,
    0.875, 0, 0.125, 0.125,];
  private inner_layer: StaticArray<f32> = [
    -0.375, 0.375, -0.25, 0.125, -0.625, 0,
    -0.25, -0.125, -0.375, -0.375, -0.125, -0.25,
    0, -0.625, 0.125, -0.25, 0.375, -0.375,
    0.25, -0.125, 0.625, 0, 0.25, 0.125,
    0.375, 0.375, 0.125, 0.25, 0, 0.625,
    -0.125, 0.25,];
  private center_layer: StaticArray<f32> = [0, 0.125, -0.125, 0, 0, -0.125, 0.125, 0,];
  private _outerR: f32 = 0.0;
  private _innerR: f32 = 0.0;

  constructor() {
    super();
    this._scale = 0.025;

    this.x = 0.0;
    this.y = 0.0;
    this.hw = 1.5 * this._scale;
    this.hh = 1.5 * this._scale;
  }

  @inline move(): void {
    if (this.active == false) {
      return;
    }

    this._innerR += 0.43;
    if (this._innerR > TWO_PI) {
      this._innerR -= TWO_PI;
    }

    this._outerR -= 0.97;
    if (this._outerR < -TWO_PI) {
      this._outerR += TWO_PI;
    }

    this.y += 0.025;

    if (this.y > 1.0) {
      this.active = false;
    }
  }

  @inline render(): void {
    if (this.active == false) {
      return;
    }

    renderLoop(this.outer_layer, this.x, this.y, YELLOW, this._outerR, this._scale)
    renderLoop(this.inner_layer, this.x, this.y, RED, this._innerR, this._scale)
    renderLoop(this.center_layer, this.x, this.y, WHITE, 0.0, this._scale)
  }

  @inline launch(x: f32): void {
    this.activate(x, -0.92);
  }

}