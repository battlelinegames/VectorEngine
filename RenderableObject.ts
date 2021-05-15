import { VectorEngine } from "./VectorEngine";

export abstract class RenderableObject { // implements Renderable {
  constructor() {
    if (VectorEngine.SN != null) {
      VectorEngine.SN.addRenderable(this);
    }
    this.visible = true;
  }

  protected _x: f32;
  get x(): f32 {
    return this._x;
  }
  set x(val: f32) {
    this._x = val;
  }

  protected _y: f32;
  get y(): f32 {
    return this._y;
  }
  set y(val: f32) {
    this._y = val;
  }


  protected _scale: f32;
  get scale(): f32 {
    return this._scale;
  }
  set scale(val: f32) {
    this._scale = val;
  }

  protected _visible: bool;
  get visible(): bool {
    return this._visible;
  }
  set visible(val: bool) {
    this._visible = val;
  }

  abstract render(): void;
}