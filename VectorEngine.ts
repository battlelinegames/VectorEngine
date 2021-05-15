//import { Clickable } from "./Clickable";
import { logi32 } from ".";
import { ClickableGameObject } from "./ClickableGameObject";
import { DisplayNum } from "./DisplayNum";
import { GameObject } from "./GameObject";
import { Input } from "./Input";
import { RenderableObject } from "./RenderableObject";
//import { Movable } from "./Movable";
//import { Renderable } from "./Renderable";

export class VectorEngine {
  // I THINK I WANT ALL OF THESE TO BE PRIVATE
  static SN: VectorEngine;

  private constructor() {
    VectorEngine.SN = this;
  }

  static init(): void {
    if (VectorEngine.SN == null) {
      new VectorEngine();
    }
    Input.init();
  }

  protected maxRenderable: u32 = 1_048_576;
  protected renderCount: u32 = 0;
  protected renderList: StaticArray<RenderableObject> = new StaticArray<RenderableObject>(this.maxRenderable);

  public addRenderable(renderable: RenderableObject): void {
    if (this.renderCount >= this.maxRenderable) {
      return;
    }

    this.renderList[this.renderCount++] = renderable;
  }

  public static renderAll(): void {
    if (VectorEngine.SN == null) {
      return;
    }

    for (let i: u32 = 0; i < VectorEngine.SN.renderCount; i++) {
      if (VectorEngine.SN.renderList[i].visible == true) {
        VectorEngine.SN.renderList[i].render();
      }
    }
  }

  protected maxClickable: u32 = 16_384;
  protected clickableCount: u32 = 0;
  protected clickableList: StaticArray<ClickableGameObject> = new StaticArray<ClickableGameObject>(this.maxClickable);

  public addClickable(clickable: ClickableGameObject): void {
    if (this.clickableCount >= this.maxClickable) {
      return;
    }

    this.clickableList[this.clickableCount++] = clickable;
  }

  public static clickCheck(): void {
    if (VectorEngine.SN == null) {
      return;
    }

    if (Input.MouseLeftButton == true) {
      for (let i: u32 = 0; i < VectorEngine.SN.clickableCount; i++) {
        if (VectorEngine.SN.clickableList[i].mouseOverTest(Input.MouseX, Input.MouseY)) {
          if (VectorEngine.SN.clickableList[i].mouseDown == false) {
            VectorEngine.SN.clickableList[i].onMouseDown();
          }
          //VectorEngine.SN.clickableList[i].mouseDown = true;
        }
      }
      let x: i32 = 320 + <i32>(Input.MouseX * 320.0);
      let y: i32 = 320 - <i32>(Input.MouseY * 320.0);

    }
    else {
      for (let i: u32 = 0; i < VectorEngine.SN.clickableCount; i++) {
        if (VectorEngine.SN.clickableList[i].mouseOverTest(Input.MouseX, Input.MouseY)) {
          VectorEngine.SN.clickableList[i].mouseOver = true;
        }
        else {
          VectorEngine.SN.clickableList[i].mouseOver = false;
        }
        if (VectorEngine.SN.clickableList[i].mouseDown == true) {
          VectorEngine.SN.clickableList[i].onMouseUp();
        }
        VectorEngine.SN.clickableList[i].mouseDown = false;
      }
      let x: i32 = 320 + <i32>(Input.MouseX * 320.0);
      let y: i32 = 320 - <i32>(Input.MouseY * 320.0);


    }

  }

  protected maxMovable: u32 = 1_048_576;
  protected movableCount: u32 = 0;
  protected movableList: StaticArray<GameObject> = new StaticArray<GameObject>(this.maxMovable);

  public addMovable(movable: GameObject): void {
    if (this.movableCount >= this.maxMovable) {
      return;
    }

    this.movableList[this.movableCount++] = movable;
  }

  public static moveAll(): void {
    if (VectorEngine.SN == null) {
      return;
    }

    for (let i: u32 = 0; i < VectorEngine.SN.movableCount; i++) {
      if (VectorEngine.SN.movableList[i].active == true) {
        VectorEngine.SN.movableList[i].move();
      }
    }
  }

}

