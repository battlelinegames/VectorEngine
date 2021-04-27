import { DisplayString } from '../../engine/DisplayString';

const helloWorld = new DisplayString("Hello World", 0.0, 0.3, 0.05, 0x00_ff_00_ff);
const assemblyScript = new DisplayString("AssemblyScript", 0.0, -0.3, 0.05, 0xff_ff_00_ff);

let scale: f32 = 0.05;
let scale_change: f32 = 0.001;
let timeChange: f32 = -2.0;
const TWO_PI: f32 = 6.28318;

export function gameLoop(delta: i32): void {
  timeChange += <f32>delta / 1000.0;
  if (timeChange > TWO_PI) {
    timeChange -= TWO_PI;
  }

  scale = (Mathf.cos(timeChange) + 1.05) / 25.0;

  helloWorld.scale = scale;
  helloWorld.render();

  scale = (Mathf.sin(timeChange) + 1.1) / 35.0;

  assemblyScript.scale = scale;
  assemblyScript.render();

}