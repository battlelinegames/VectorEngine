import { renderLoop } from ".";
import { GameObject } from "./GameObject";
import { Clickable } from "./Clickable";
import { DisplayString } from "./DisplayString";

class Button extends GameObject implements Clickable {
  protected _scale: f32 = 1.0;

  boxLoop: StaticArray<f32> = [-1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  overColor: u32 = 0xff_ff_ff_ff;
  downColor: u32 = 0xff_63_00_ff;
  color: u32 = 0xff_ff_00_ff;
  halfWidth: f32 = 1.0;
  halfHeight: f32 = 1.0;

  mouseDown: bool;
  label: DisplayString;

  constructor(label_str: string, x: f32, y: f32, scale: f32,
    color: u32, over_color: u32, down_color: u32) {
    super();
    this.overColor = over_color;
    this.downColor = down_color;
    this.label = new DisplayString(label_str, x, y, scale, color);
    this.scale = scale;
    this.halfHeight = this.scale / 2.0;
    this.halfWidth = this.scale * label_str.length;
    this.visible = true;
  }

  set scale(s: f32) {
    this._scale = s;
    this.boxLoop[0] = <f32>this.label.charArray.length * -s; // top left x
    this.boxLoop[1] = s;  // top left y
    this.boxLoop[2] = <f32>this.label.charArray.length * s; // top right x
    this.boxLoop[3] = s;  // top right y
    this.boxLoop[4] = <f32>this.label.charArray.length * s; // bottom right x
    this.boxLoop[5] = -s;  // bottom right y
    this.boxLoop[6] = <f32>this.label.charArray.length * -s; // bottom left x
    this.boxLoop[7] = -s;  // bottom left y
  }

  get scale(): f32 {
    return this._scale;
  }

  mouseDownTest(x: f32, y: f32): bool {
    if (x > this.x - this.halfWidth && x < this.x + this.halfWidth &&
      y > this.y - this.halfHeight && y < this.y + this.halfHeight) {
      this.mouseDown = true;
      this.label.color = this.downColor;
      return true;
    }
    return false;
  }

  mouseUpTest(x: f32, y: f32): bool {
    this.mouseDown = false;
    if (x > this.x - this.halfWidth && x < this.x + this.halfWidth &&
      y > this.y - this.halfHeight && y < this.y + this.halfHeight) {
      this.label.color = this.color;
      return true;
    }
    return false;
  }

  mouseOverTest(x: f32, y: f32): bool {
    if (x > this.x - this.halfWidth && x < this.x + this.halfWidth &&
      y > this.y - this.halfHeight && y < this.y + this.halfHeight) {
      this.label.color = this.overColor;
      return true;
    }
    return false;
  }

  render(): void {
    if (this.visible == true) {
      renderLoop(this.boxLoop, this.x, this.y, this.label.color, 0.0, this._scale);
      this.label.render();
    }
  }

  move(): void {
    // doesn't do anything yet
  }

}

