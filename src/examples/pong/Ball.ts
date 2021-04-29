import { playSFX } from '../../engine/VectorEngine';
import { renderLoop, RENDER_TYPE } from '../../engine/VectorEngine';
import { Collider } from './Collider';
import { d1, d2 } from './pong';
import { bounceSound, lostSound, wonSound } from './sounds';

export class Ball extends Collider {
  color: i32 = 0xff_ff_00_ff;
  scale: f32 = 0.05;
  rotation: f32 = 0.0;
  loopData: StaticArray<f32>;
  xvel: f32 = 0.005;
  yvel: f32 = -0.02;
  delay: i32 = 100;

  constructor() {
    super();
    this.loopData =
      [0.25, 0.875, 0.5, 0.75,
        0.75, 0.5, 0.875, 0.25,
        0.875, -0.25, 0.75, -0.5,
        0.5, -0.75, 0.25, -0.875,
        -0.25, -0.875, -0.5, -0.75,
        -0.75, -0.5, -0.875, -0.25,
        -0.875, 0.25, -0.7421875, 0.4921875,
        -0.5, 0.75, -0.25, 0.875,];

    // set half width & half height
    this.hw = this.hh = this.scale;
    this.y = 0.75;
  }

  @inline reset(): void {
    this.yvel = -this.yvel;
    this.xvel = -this.xvel;
    this.x = 0.0;
    this.y = 0.0;
  }

  @inline render(): void {
    if (this.delay > 0) {
      return;
    }
    renderLoop(this.loopData,
      this.x, this.y, this.color, 0.0, this.scale);
  }

  @inline move(): void {
    if (this.delay > 0) {
      this.delay--;
      return;
    }
    this.x += this.xvel;
    this.y += this.yvel;
    this.rotation += 0.1;

    if (this.x < -1.0 || this.x > 1.0) {
      bounceSound();
      this.xvel = -this.xvel;
    }
    if (this.y < -1.0 || this.y > 1.0) {
      if (this.y < -1.0) {
        d1.num++;
        lostSound();
        this.delay = 100;
        this.y = -0.75;
        this.yvel = this.yvel;
      }
      else if (this.y > 1.0) {
        d2.num++;
        wonSound();
        this.delay = 100;
        this.delay = 100;
        this.y = 0.75;
        this.yvel = this.yvel;
      }
      this.yvel = -this.yvel;
    }
  }

  hitTest(c: Collider): bool {
    if (this.x + this.hw > c.x - c.hw &&
      this.x - this.hw < c.x + c.hw &&
      this.y + this.hh > c.y - c.hh &&
      this.y - this.hh < c.y + c.hh) {
      this.color = 0xff_00_00_ff;
      return true;
    }
    this.color = 0xff_ff_00_ff;
    return false;
  }
}