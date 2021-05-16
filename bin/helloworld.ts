import { Input, VectorEngine, Button, DisplayString } from 'vectorengine';

export { VectorEngineExports } from 'vectorengine';
VectorEngine.init();

const white: u32 = 0xff_ff_ff_ff;

var text = new DisplayString("hello world", 0.0, 0.3, 0.05, white);

let time_count: f32 = 0.0;

export function gameLogic(delta: i32): void {
  time_count += <f32>delta / 1000.0;
  // put your game logic here
  text.y += time_count;
  if (text.y >= 1.05) {
    text.y = -1.05;
  }
}