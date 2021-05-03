import { renderLoop, RENDER_TYPE } from '../../engine/index';
import { GameObject } from './GameObject';

export class Shield extends GameObject {
  private color: u32 = 0xff_ff_ff_ff; // default layer color 0xff_00_ff_ff; // leftside layer color 0xff_00_ff_ff; // rightside layer color

  // not sure if I want to use left & right side loops
  private default_layer: StaticArray<f32> = [
    -0.625, 0.5,
    -0.25, 0.875,
    0.25, 0.875,
    0.625, 0.5,
    0.625, -0.875,
    0.25, -0.875,
    0.25, -0.625,
    -0.25, -0.625,
    -0.25, -0.875,
    -0.625, -0.875,];
  //var leftside_layer:StaticArray<f32>=[-0.625, 0.5, -0.25, 0.875, -0.25, -0.875, -0.625, -0.875, ];
  //var rightside_layer:StaticArray<f32>=[0.25, 0.875, 0.625, 0.5, 0.625, -0.875, 0.2578125, -0.8828125, ];

  @inline move(): void {

  }
  @inline render(): void {

  }
}

