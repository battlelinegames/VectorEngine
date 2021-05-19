import { renderLoop } from ".";
import { DisplayString } from "./DisplayString";
import { VectorEngine } from "./VectorEngine";
import { logf32, logi32 } from ".";
import { ClickableGameObject } from "./ClickableGameObject";

export class Button extends ClickableGameObject {
  // REGISTER A BUTTON 
  rotation: f32;

  boxLoop: StaticArray<f32> = [-1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  overColor: u32 = 0xff_ff_ff_ff;
  downColor: u32 = 0xff_63_00_ff;
  color: u32 = 0xff_ff_00_ff;
  halfWidth: f32 = 1.0;
  halfHeight: f32 = 1.0;
  label: DisplayString;

  protected _onMouseDown: () => void;
  protected _onMouseUp: () => void;

  @inline get mouseDown(): bool {
    return this._mouseDown;
  }

  @inline set mouseDown(val: bool) {
    this._mouseDown = val;
  }

  @inline get mouseOver(): bool {
    return this._mouseOver;
  }

  @inline set mouseOver(val: bool) {
    this._mouseOver = val;
  }

  @inline get x(): f32 {
    return this._x;
  }
  @inline set x(val: f32) {
    this._x = val;
    this.label.x = val;

  }

  @inline get y(): f32 {
    return this._y;
  }
  @inline set y(val: f32) {
    this._y = val;
    this.label.y = val;
  }

  @inline get visible(): bool {
    return this._visible;
  }

  @inline set visible(val: bool) {
    this._visible = val;
    this.label.visible = false;
  }

  constructor(label_str: string, x: f32, y: f32, scale: f32,
    color: u32, over_color: u32, down_color: u32, on_mouse_down: () => void,
    on_mouse_up: () => void) {
    super();
    this._onMouseDown = on_mouse_down;
    this._onMouseUp = on_mouse_up;
    this.label = new DisplayString(label_str, x, y, scale, color);

    if (VectorEngine.SN != null) {
      VectorEngine.SN.addClickable(this);
      VectorEngine.SN.addRenderable(this);

    }
    this.color = color;
    this.overColor = over_color;
    this.downColor = down_color;
    this.halfHeight = scale * 1.3;
    this.halfWidth = scale * <f32>label_str.length * 1.25;
    this.scale = scale;
    this.visible = true;
    this.x = x;
    this.y = y;
  }

  @inline onMouseDown(): void {
    this.mouseDown = true;
    this._onMouseDown();
  }

  @inline onMouseUp(): void {
    this.mouseDown = false;
    this._onMouseUp();
  }

  @inline set scale(s: f32) {
    this._scale = s;
    this.halfHeight = s * 1.3;
    this.halfWidth = s * <f32>this.label.charArray.length * 1.25;
    this.boxLoop[0] = -this.halfWidth; // top left x
    this.boxLoop[1] = this.halfHeight;  // top left y
    this.boxLoop[2] = this.halfWidth; // top right x
    this.boxLoop[3] = this.halfHeight;  // top right y
    this.boxLoop[4] = this.halfWidth; // bottom right x
    this.boxLoop[5] = -this.halfHeight;  // bottom right y
    this.boxLoop[6] = -this.halfWidth; // bottom left x
    this.boxLoop[7] = -this.halfHeight;  // bottom left y
  }

  @inline get scale(): f32 {
    return this._scale;
  }

  mouseOverTest(x: f32, y: f32): bool {
    if (x > this._x - this.halfWidth && x < this._x + this.halfWidth &&
      y > this._y - this.halfHeight && y < this._y + this.halfHeight) {
      return true;
    }
    return false;
  }

  move(): void {
  }

  render(): void {
    if (this.visible == true) {
      let color: u32 = this.color;

      if (this.mouseDown == true) {
        color = this.downColor;
      }
      else if (this.mouseOver == true) {
        color = this.overColor;
      }

      this.label.color = color;
      renderLoop(this.boxLoop, this._x, this._y, color, 0.0, 1.0);
      //this.label.render();
    }
  }
}

