import { Input } from '../../engine/Input';
import { renderLoop, RENDER_TYPE } from '../../engine/index';
import { Collider } from './Collider';
import { logf32 } from '../../engine/index';

export class Player extends Collider {
  color: i32 = 0x00_ff_00_ff;
  scale: f32 = 0.2;
  loopData: StaticArray<f32>;

  constructor() {
    super();
    this.loopData =
      [-0.9, 0.15,
        0.9, 0.15,
        0.9, -0.15,
      -0.9, -0.15,];
    this.hw = 0.9 * this.scale;
    this.hh = 0.15 * this.scale;
    this.y = -0.95;
  }

  @inline render(): void {
    renderLoop(this.loopData,
      this.x, this.y, this.color, 0.0, this.scale);
  }

  @inline move(): void {
    this.x = Input.MouseX;

    if (this.x < -1.0) {
      this.x = -1.0;
    }
    else if (this.x > 1.0) {
      this.x = 1.0;
    }
    //logf32(this.x);
  }
}