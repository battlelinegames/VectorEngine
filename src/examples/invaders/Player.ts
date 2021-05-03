import { Input, renderLoop, RENDER_TYPE, KEY } from '../../engine/index';
import { AnimatedObject } from './AnimatedObject';
import { DELTA_S, shoot, GAME_STARTED } from './Game';
//import { GameObject } from './GameObject';

export class Player extends AnimatedObject {
  vel: f32 = 0.5;
  shotCoolDown: f32 = 1.0;
  shotTime: f32 = 0.0;
  default_layer: StaticArray<f32> = [
    0.125, -0.875, -0.125, -0.875, -0.125, -0.625,
    -0.25, -0.625, -0.25, -0.375, -0.5, -0.75,
    -0.5, -0.875, -0.625, -0.875, -0.625, -0.25,
    -0.5, -0.25, -0.5, -0.5, -0.25, -0.125,
    -0.125, 0.875, 0.125, 0.875, 0.25, -0.125,
    0.625, -0.5, 0.625, -0.25, 0.75, -0.25,
    0.75, -0.875, 0.625, -0.875, 0.625, -0.75,
    0.25, -0.375, 0.25, -0.625, 0.125, -0.625,];

  constructor() {
    super();
    this._scale = 0.05;
    this.y = -0.95;
    this.hw = this._scale;
    this.hh = this._scale;
    this.active = true;

  }

  @inline move(): void {
    if (this.active == false || GAME_STARTED == false) {
      return;
    }
    this.shotTime -= DELTA_S;
    if (Input.GetKey(KEY.A) || Input.GetKey(KEY.LEFT)) {
      this.x -= DELTA_S * this.vel;
    }
    else if (Input.GetKey(KEY.D) || Input.GetKey(KEY.RIGHT)) {
      this.x += DELTA_S * this.vel;
    }

    if (Input.GetKey(KEY.SPACE) && this.shotTime < 0.0) {
      shoot();
      this.shotTime = this.shotCoolDown;
    }
  }

  @inline render(): void {
    if (this.active == false || GAME_STARTED == false) {
      return;
    }
    renderLoop(this.default_layer, this.x, this.y, 0xff_ff_ff_ff, 0.0, this._scale)
  }
}