import { Renderable } from "./Renderable";

export abstract class GameObject implements Renderable {
  x: f32;
  y: f32;
  rotation: f32;
  scale: f32;
  visible: bool;

  abstract render(): void;
  abstract move(): void;
}