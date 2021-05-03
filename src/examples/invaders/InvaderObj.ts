import { renderLoop } from "../../engine";
import { GAME_STARTED } from "./Game";
import { GameObject } from "./GameObject";

export abstract class InvaderObj extends GameObject {
  static MOV: f32 = 0.05;
  color: u32 = 0xff_ff_ff_ff;
  frame: u32 = 0;

  constructor() {
    super();
    this.active = true;
  }

  @inline move(): void {
    if (this.active == false) {
      return;
    }

    if (GAME_STARTED == true) {
      this.x += InvaderObj.MOV;
    }

    this.frame++;
    if (this.frame >= 2) {
      this.frame = 0;
    }
  }

  abstract render(): void;
}
