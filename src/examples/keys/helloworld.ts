import { Char } from '../../engine/Char';
import { DisplayString } from '../../engine/DisplayString';
import { Input, KEY } from '../../engine/Input';

Input.init();
const str: DisplayString = new DisplayString("press a key", 0.0, 0.6, 0.05, 0xff_ff_00_ff);
const c: Char = new Char();
c.scale = 0.5;
c.color = 0xff_ff_ff_ff;

export function gameLoop(delta: i32): void {

  c.charCode = KEY.SPACE;

  for (var i: i32 = 0; i < 100; i++) {
    if (Input.GetKey(i)) {
      c.charCode = i;
    }
  }

  c.render();
  str.render();
}