import { Char } from './Char';
import { KEY } from './Input';
import { RenderableObject } from './RenderableObject';
import { VectorEngine } from './VectorEngine';

export class DisplayString extends RenderableObject {
  charArray: StaticArray<Char>;
  protected _color: u32 = 0xff_ff_ff_ff;

  constructor(str: String, x: f32, y: f32,
    scale: f32, color: u32 = 0xff_ff_ff_ff) {
    super();
    const len = str.length;
    this._x = x;
    this._y = y;
    let cx = x - <f32>len * scale + scale / 2.0;
    this._color = color;
    this._scale = scale;
    this.charArray = new StaticArray<Char>(len);
    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i] = new Char();
      this.charArray[i].charCode = str.charCodeAt(i);
      this.charArray[i].x = cx;
      this.charArray[i].y = y;
      this.charArray[i].color = color;
      this.charArray[i].scale = scale;
      cx += scale * 2.0;
    }
    this.visible = true;
    VectorEngine.SN.addRenderable(this);
  }

  overwrite(str: string): void {
    for (let i: i32 = 0; i < this.charArray.length; i++) {
      if (i >= str.length) {
        this.charArray[i].charCode = KEY.SPACE;
        continue;
      }
      this.charArray[i].charCode = str.charCodeAt(i);
    }
  }

  @inline set x(val: f32) {
    let len = this.charArray.length;
    let cx = val - <f32>(len - 1) * this._scale + this._scale / 2.0;
    this._x = val;

    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].x = cx;
      cx += this._scale * 2;
    }
  }

  @inline set y(val: f32) {
    let len = this.charArray.length;
    this._y = val;
    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].y = val;
    }
  }

  set color(val: u32) {
    let len = this.charArray.length;
    this._color = val;
    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].color = val;
    }
  }
  @inline get color(): u32 {
    return this._color;
  }

  @inline set scale(val: f32) {
    let len = this.charArray.length;
    this._scale = val;
    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].scale = val;
    }
    let cx = this._x - <f32>len * this._scale + this._scale / 2.0;

    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].x = cx;
      cx += this._scale * 2;
    }
  }
  @inline get scale(): f32 {
    return this._scale;
  }

  @inline get visible(): bool {
    return this._visible;
  }

  @inline set visible(val: bool) {
    this._visible = val;
  }

  @inline public render(): void {
    if (this._visible == false) {
      return;
    }

    let len = this.charArray.length;
    for (let i: i32 = 0; i < len; i++) {
      this.charArray[i].render();
    }
  }
}