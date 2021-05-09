export interface Renderable {
  x: f32;
  y: f32;
  visible: bool;

  render(): void;
}