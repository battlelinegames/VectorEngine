import { Char } from '../../engine/Char';
import { DisplayString } from '../../engine/DisplayString';
import { DisplayNum } from '../../engine/DisplayNum';
import { Input, KEY } from '../../engine/Input';

Input.init();
const mouse_x: DisplayString = new DisplayString("Mouse X ", -0.56, 0.6, 0.05, 0xff_ff_00_ff);
const mouse_x_num: DisplayNum = new DisplayNum(0, 3, 0.0, 0.6, 0.05, 0xff_ff_00_ff)
const mouse_y: DisplayString = new DisplayString("Mouse Y ", -0.56, 0.4, 0.05, 0xff_ff_00_ff);
const mouse_y_num: DisplayNum = new DisplayNum(0, 3, 0.0, 0.4, 0.05, 0xff_ff_00_ff)

const left_button: DisplayString = new DisplayString("Left ", -0.70, 0.2, 0.05, 0xff_ff_00_ff);
const left_num: DisplayNum = new DisplayNum(0, 1, 0.0, 0.2, 0.05, 0xff_ff_00_ff)
const right_button: DisplayString = new DisplayString("Right ", -0.66, 0.0, 0.05, 0xff_ff_00_ff);
const right_num: DisplayNum = new DisplayNum(0, 1, 0.0, 0.0, 0.05, 0xff_ff_00_ff)
const middle_button: DisplayString = new DisplayString("Middle ", -0.595, -0.2, 0.05, 0xff_ff_00_ff);
const middle_num: DisplayNum = new DisplayNum(0, 1, 0.0, -0.2, 0.05, 0xff_ff_00_ff)

export function gameLoop(delta: i32): void {

  let x: i32 = 320 + <i32>(Input.MouseX * 320.0);
  let y: i32 = 320 - <i32>(Input.MouseY * 320.0);
  mouse_x_num.num = x;
  mouse_y_num.num = y;

  mouse_x.render();
  mouse_y.render();
  mouse_x_num.render();
  mouse_y_num.render();

  left_button.render();
  right_button.render();
  middle_button.render();

  left_num.num = <i32>Input.MouseLeftButton;
  left_num.render();

  right_num.num = <i32>Input.MouseRightButton;
  right_num.render();

  middle_num.num = <i32>Input.MouseMiddleButton;
  middle_num.render();

}