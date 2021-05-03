import { GameObject } from './GameObject';

export abstract class AnimatedObject extends GameObject {
  protected _frame: i32;
  protected _maxFrame: i32;
  abstract move(): void;
  abstract render(): void;

  nextFrame(): i32 {
    this._frame++;
    if (this._frame > this._maxFrame) {
      this._frame = 0;
    }

    return this._frame;
  }
}