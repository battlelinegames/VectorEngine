import { Clickable } from "./Clickable";
import { Renderable } from "./Renderable";

export class VectorEngine {
  // I THINK I WANT ALL OF THESE TO BE PRIVATE
  maxRenderable: u32 = 1_048_576;
  renderCount: u32 = 0;
  renderList: StaticArray<Renderable> = new StaticArray<Renderable>(this.maxRenderable);

  maxClickable: u32 = 16_384;
  clickableCount: u32 = 0;
  clickableList: StaticArray<Clickable> = new StaticArray<Clickable>(this.maxClickable);
}