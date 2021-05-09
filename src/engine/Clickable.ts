import { Input } from "./Input";

export interface Clickable {
  mouseDown: bool;
  mouseDownTest(x: f32, y: f32): bool;
  mouseUpTest(x: f32, y: f32): bool;
}