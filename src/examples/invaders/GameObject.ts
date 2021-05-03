export abstract class GameObject {
  x: f32;
  y: f32;
  hw: f32;
  hh: f32;
  active: bool = false;

  protected _scale: f32;

  abstract move(): void;
  abstract render(): void;

  @inline hitTest(go: GameObject): bool {
    if (this.x + this.hw > go.x - go.hw &&
      this.x - this.hw < go.x + go.hw &&
      this.y + this.hh > go.y - go.hh &&
      this.y - this.hh < go.y + go.hh) {
      return true;
    }
    return false;
  }

  @inline activate(x: f32, y: f32): void {
    this.x = x;
    this.y = y;
    this.active = true;
  }
}