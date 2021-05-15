import { GameObject } from "./GameObject"
import { VectorEngine } from "./VectorEngine"

export abstract class ClickableGameObject extends GameObject { //implements Clickable {
  constructor() {
    super();
    if (VectorEngine.SN != null) {
      VectorEngine.SN.addClickable(this);
    }
  }
  protected _mouseDown: bool;
  protected _mouseOver: bool;

  get mouseDown(): bool {
    return this._mouseDown;
  }

  set mouseDown(val: bool) {
    this._mouseDown = val;
  }

  get mouseOver(): bool {
    return this._mouseOver;
  }

  set mouseOver(val: bool) {
    this._mouseOver = val;
  }

  abstract mouseOverTest(x: f32, y: f32): bool;
  abstract onMouseDown(): void;
  abstract onMouseUp(): void;
}