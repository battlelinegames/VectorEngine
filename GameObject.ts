import { RenderableObject } from "./RenderableObject";
import { VectorEngine } from "./VectorEngine";

export abstract class GameObject extends RenderableObject { //implements Movable, Renderable {
  constructor() {
    super();
    if (VectorEngine.SN != null) {
      VectorEngine.SN.addMovable(this);
    }
    this.active = true;
  }

  protected _active: bool;
  get active(): bool {
    return this._active;
  }
  set active(val: bool) {
    this._active = val;
  }

  abstract move(): void;
  abstract render(): void;
}