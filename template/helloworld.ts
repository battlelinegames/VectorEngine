import { DisplayString } from '../lib/VectorEngine';

const vectorEngineDisplay = new DisplayString("VectorEngine", 0.0, 0.3, 0.05, 0x00_ff_00_ff);

let scale: f32 = 0.05;
let scale_change: f32 = 0.001;
let timeChange: f32 = -2.0;
const TWO_PI: f32 = 6.28318;

export function gameLoop(delta: i32): void {
  timeChange = <f32>delta / 1000.0;
  vectorEngineDisplay.render();

  scale = (Mathf.sin(timeChange) + 1.1) / 35.0;

  assemblyScript.scale = scale;
  assemblyScript.render();

}