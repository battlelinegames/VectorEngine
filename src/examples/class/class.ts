import { DisplayString, renderLoop } from '../../engine/index';
// /vectorengine/lib/vectorengine.ts';

const wasmBook = new DisplayString("WasmBook.com", 0.0, 0.3, 0.04, 0xff_ff_00_ff);
const red: u32 = 0xff_00_00_ff;

let scale: f32 = 0.05;
let timeChange: f32 = -2.0;
const TWO_PI: f32 = 6.28318;

class SmileObject {
  public color: u32 = 0x00_ff_00_ff; // default layer color 0xff_00_ff_ff; // lefteye layer color 0xff_00_ff_ff; // mouth layer color
  public x: f32 = 0.0;
  public y: f32 = 0.0;
  public rotation: f32 = 0.0;
  public scale: f32 = 0.0;

  private main_layer: StaticArray<f32> =
    [-0.125, 0.609375, 0.125, 0.609375, 0.375, 0.5,
      0.5, 0.375, 0.625, 0.125, 0.6328125, -0.1328125,
      0.5078125, -0.3828125, 0.3828125, -0.5078125, 0.125, -0.625,
    -0.125, -0.625, -0.3671875, -0.5078125, -0.4765625, -0.3828125,
    -0.6171875, -0.1328125, -0.6171875, 0.1171875, -0.4921875, 0.3671875,
    -0.3671875, 0.4921875,];

  private lefteye_layer: StaticArray<f32> = [
    -0.34375, 0.24375, -0.28125, 0.275, -0.21875, 0.275,
    -0.15625, 0.24375, -0.125, 0.18125, -0.125, 0.11875,
    -0.15625, 0.05625, -0.21875, 0.025, -0.28125, 0.025,
    -0.34375, 0.05625, -0.375, 0.103125, -0.375, 0.18125,];

  private righteye_layer: StaticArray<f32> = [
    0.34375, 0.24375, 0.28125, 0.275, 0.21875, 0.275,
    0.15625, 0.24375, 0.125, 0.18125, 0.125, 0.11875,
    0.15625, 0.05625, 0.21875, 0.025, 0.28125, 0.025,
    0.34375, 0.05625, 0.375, 0.103125, 0.375, 0.18125,];

  private mouth_layer: StaticArray<f32> = [
    -0.375, -0.171875, 0.375, -0.171875, 0.3125, -0.375,
    0.125, -0.5, -0.125, -0.5, -0.3125, -0.375,];



  public render(): void {
    renderLoop(this.main_layer, this.x, this.y, this.color, this.rotation, this.scale);
    renderLoop(this.lefteye_layer, this.x, this.y, this.color, this.rotation, this.scale);
    renderLoop(this.righteye_layer, this.x, this.y, this.color, this.rotation, this.scale);
    renderLoop(this.mouth_layer, this.x, this.y, this.color, this.rotation, this.scale);
  }
}

var smile = new SmileObject();
smile.scale = 0.15;

var smile_left = new SmileObject();
smile_left.x = -0.4;
smile_left.color = 0xff_00_ff_ff;
smile_left.scale = 0.15;

var smile_right = new SmileObject();
smile_right.x = 0.4;
smile_right.color = 0x00_ff_ff_ff;
smile_right.scale = 0.15;


export function gameLoop(delta: i32): void {
  timeChange += <f32>delta / 1000.0;

  if (timeChange > TWO_PI) {
    timeChange -= TWO_PI;
  }

  scale = (Mathf.cos(timeChange * 18) + 1.05) / 50.0 + 0.2;

  wasmBook.render();

  smile.rotation = timeChange;
  smile.render();
  smile_left.render();
  smile_right.render();
}