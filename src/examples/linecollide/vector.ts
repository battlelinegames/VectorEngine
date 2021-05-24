export class Vector {
  x: f32 = 0.0;
  y: f32 = 0.0;

  constructor(x: f32 = 0.0, y: f32 = 0.0) {
    this.x = x;
    this.y = y;
  }

  @inline public magnitude(): f32 {
    return Mathf.sqrt(this.x * this.x + this.y * this.y);
  }

  @inline public magSq(): f32 {
    return this.x * this.x + this.y * this.y;
  }

  @inline public normalize(magnitude: f32 = 1.0): Vector {
    let len: f32 = Mathf.sqrt(this.x * this.x + this.y * this.y);
    this.x /= len;
    this.y /= len;
    return this;
  }

  @inline zero(): void {
    this.x = 0.0;
    this.y = 0.0;
  }

  @inline copy(point: Vector): void {
    this.x = point.x;
    this.y = point.y;
  }

  @inline duplicate(): Vector {
    const dup: Vector = new Vector(this.x, this.y);
    return dup;
  }

  @inline rotate(radians: f32): void {
    const cos: f32 = Mathf.cos(radians);
    const sin: f32 = Mathf.sin(radians);
    const x: f32 = (cos * this.x) + (sin * this.y);
    this.y = (cos * this.y) - (sin * this.x);
    this.x = x;
  }

  @inline rotate90(): void {
    const x: f32 = -this.y;
    this.y = this.x;
    this.x = x;
  }

  @inline add(value: Vector): void {
    this.x += value.x;
    this.y += value.y;
  }

  @inline subtract(vec: Vector): void {
    this.x -= vec.x;
    this.y -= vec.y;
  }

  @inline multiply(value: f32): void {
    this.x *= value;
    this.y *= value;
  }

  @inline dot(vec: Vector): f32 {
    return this.x * vec.x + this.y * vec.y;
  }

  @inline project(onto: Vector, projected: Vector): void {
    let d = onto.magSq();

    if (d >= 0.0) {
      let dot_product = this.dot(onto);
      projected.copy(this);
      projected.multiply(dot_product / d);
    }
    else {
      projected.copy(onto);
    }
  }
}
