import { renderLoop, RENDER_TYPE } from '../../engine/index';
import { Collider } from './Collider';
import { Ball } from './Ball';

export class AI extends Collider {
  color: i32 = 0xff_00_00_ff;
  scale: f32 = 0.2;
  loopData: StaticArray<f32>;
  ball: Ball;

  constructor(ball: Ball) {
    super();
    this.loopData =
      [-0.9, 0.15,
        0.9, 0.15,
        0.9, -0.15,
      -0.9, -0.15,];
    this.hw = 0.9 * this.scale;
    this.hh = 0.15 * this.scale;
    this.ball = ball;
    this.y = 0.95;
  }

  @inline render(): void {
    renderLoop(this.loopData,
      this.x, this.y, this.color, 0.0, this.scale);
  }

  @inline move(): void {
    if (this.ball.yvel > 0.0) {
      if (this.ball.x > this.x && this.ball.x - this.x > 0.01) {
        this.x += 0.006;
      }
      else if (this.ball.x < this.x && this.x - this.ball.x > 0.01) {
        this.x -= 0.006;
      }
    }
    else {
      if (this.x > 0.01) {
        this.x -= 0.01;
      }
      else if (this.x < -0.01) {
        this.x += 0.01;
      }
    }
  }
}