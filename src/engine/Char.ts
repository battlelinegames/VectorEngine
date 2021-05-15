import { renderLine } from './index';
import { RenderableObject } from './RenderableObject';

export class Char extends RenderableObject {
  public static SPACE: u32 = 100;
  // I need to figure out how to replace the data below with an i8 memory.data block
  // memory.data<i8>([100, 99, 33, -8], alignment); 
  // I think I am going to have a length byte followed by the x y data, then 
  // another length byte.
  private charData: StaticArray<StaticArray<f32>> =
    [
      [-0.5, -0.75, 0.5, 0.75, 0.375, 0.875, -0.375, 0.875,
      -0.625, 0.625, -0.625, -0.625, -0.375, -0.875, 0.375, -0.875,
        0.625, -0.625, 0.625, 0.625, 0.5, 0.75,], // 0
      [-0.25, 0.625, 0, 0.875, 0, -0.875,
      -0.625, -0.875, 0.6328125, -0.8828125,], // 1
      [-0.625, 0.5, -0.625, 0.625, -0.375, 0.875, 0.375, 0.875,
        0.625, 0.625, 0.625, 0.125, 0.375, -0.125, -0.375, -0.125,
      -0.625, -0.375, -0.625, -0.875, 0.6328125, -0.8671875,], // 2
      [-0.625, 0.5, -0.625, 0.625, -0.375, 0.875, 0.375, 0.875,
        0.625, 0.625, 0.625, 0.25, 0.375, 0, -0.25, 0,
        0.375, 0, 0.625, -0.25, 0.625, -0.625, 0.375, -0.875,
      -0.375, -0.875, -0.625, -0.625, -0.6171875, -0.4921875,], // 3
      [-0.25, 0.875, -0.625, 0, 0.625, 0, 0.625, 0.875, 0.625, -0.875,], // 4
      [0.625, 0.875, -0.625, 0.875, -0.625, 0.125, 0.375, 0.125,
        0.625, -0.125, 0.625, -0.625, 0.375, -0.875, -0.6171875, -0.8671875,], // 5
      [0.375, 0.875, -0.375, 0.875, -0.625, 0.625, -0.625, -0.625,
        -0.375, -0.875, 0.375, -0.875, 0.625, -0.625, 0.625, -0.25,
        0.375, 0, -0.375, 0, -0.6171875, -0.2578125,], // 6
      [-0.75, 0.75, -0.75, 0.875, 0.625, 0.875, 0.0078125, -0.8828125,], // 7
      [-0.625, 0.625, -0.375, 0.875, 0.375, 0.875, 0.625, 0.625,
        0.625, 0.25, 0.375, 0, -0.3671875, -0.0078125, -0.625, -0.25,
      -0.625, -0.625, -0.375, -0.875, 0.375, -0.875, 0.625, -0.625,
        0.625, -0.25, 0.375, 0, -0.375, 0, -0.625, 0.25, -0.625, 0.625,], // 8
      [0.0078125, -0.8828125, 0.625, 0.375, 0.625, 0.625, 0.375, 0.875,
        -0.375, 0.875, -0.625, 0.625, -0.6171875, 0.2578125, -0.375, 0,
        0.4375, 0,], // 9
      [-0.625, -0.875, -0.625, 0.25, 0, 0.875,
        0.625, 0.25, 0.625, -0.875, 0.625, 0, -0.625, 0,], // A
      [-0.625, -0.875, -0.625, 0.875, 0.375, 0.875, 0.625, 0.625,
        0.6328125, 0.2421875, 0.375, 0, -0.625, 0, 0.375, 0,
        0.625, -0.25, 0.625, -0.625, 0.375, -0.875, -0.625, -0.875,], // B
      [0.625, 0.625, 0.625, 0.75, 0.5, 0.875, -0.5, 0.875,
        -0.625, 0.75, -0.625, -0.75, -0.5, -0.875, 0.5, -0.875,
        0.625, -0.75, 0.6328125, -0.6328125,], // C
      [-0.625, -0.875, -0.625, 0.875, 0, 0.875, 0.25, 0.75,
        0.5, 0.5, 0.625, 0.25, 0.625, -0.25, 0.5, -0.5,
        0.25, -0.75, 0.125, -0.875, -0.625, -0.875,], // D
      [0.625, -0.875, -0.625, -0.875, -0.625, 0, 0, 0,
        -0.625, 0, -0.625, 0.875, 0.625, 0.875,], // E
      [-0.625, -0.875, -0.625, 0, 0.125, 0, -0.625, 0,
      -0.625, 0.875, 0.6171875, 0.8671875,], // F
      [0.625, 0.5, 0.625, 0.625, 0.375, 0.875, -0.375, 0.875,
        -0.625, 0.625, -0.625, -0.625, -0.375, -0.875, 0.375, -0.875,
        0.625, -0.625, 0.625, -0.25, 0.5, -0.125, 0.25, -0.125,], // G
      [-0.625, -0.875, -0.625, 0.875, -0.625, 0, 0.625, 0,
        0.6328125, 0.8828125, 0.625, -0.875,], // H
      [-0.6171875, -0.8671875, 0.625, -0.875, 0, -0.875, 0, 0.875,
      -0.625, 0.875, 0.625, 0.875,], // I
      [0.625, 0.875, 0.625, -0.625, 0.375, -0.875, -0.1171875, -0.8828125,
        -0.625, -0.375,], // J
      [-0.625, 0.875, -0.625, -0.875, -0.625, 0, 0.625, 0.625,
      -0.625, 0, 0.625, -0.875,], // K
      [-0.6171875, 0.8671875, -0.625, -0.875, 0.625, -0.875,], // L
      [-0.625, -0.875, -0.625, 0.875, 0, 0.25, 0.625, 0.875,
        0.6328125, -0.8828125,], // M
      [-0.625, -0.875, -0.625, 0.875, 0.625, -0.875, 0.6328125, 0.8671875,], // N
      [-0.375, -0.875, -0.625, -0.625, -0.625, 0.625, -0.375, 0.875,
        0.375, 0.875, 0.625, 0.625, 0.625, -0.625, 0.3828125, -0.8828125, -0.375, -0.875,], // O
      [-0.625, -0.875, -0.625, 0.875, 0.3828125, 0.8828125, 0.625, 0.625,
        0.625, 0.25, 0.375, 0, -0.625, 0,], // P
      [0.625, -0.875, 0.25, -0.5, 0.375, -0.625, 0.125, -0.875,
        -0.375, -0.875, -0.625, -0.625, -0.625, 0.625, -0.375, 0.875,
        0.375, 0.875, 0.625, 0.625, 0.6328125, -0.3828125, 0.375, -0.625,], // Q
      [-0.6171875, -0.8828125, -0.625, 0.875, 0.375, 0.875, 0.625, 0.625,
        0.625, 0.25, 0.375, 0, -0.625, 0, 0.625, -0.875,], // R
      [0.625, 0.625, 0.375, 0.875, -0.375, 0.875, -0.625, 0.625,
        -0.625, 0.25, -0.375, 0, 0.375, 0, 0.625, -0.25,
        0.625, -0.625, 0.375, -0.875, -0.375, -0.875, -0.6171875, -0.6328125,], // S
      [0.0078125, -0.8828125, 0, 0.875, -0.625, 0.875, 0.625, 0.875,], // T
      [-0.625, 0.875, -0.625, -0.625, -0.375, -0.875, 0.375, -0.875,
        0.625, -0.625, 0.6328125, 0.8671875,], // U
      [-0.625, 0.875, 0, -0.875, 0.6328125, 0.8671875,], // V
      [-0.625, 0.875, -0.625, -0.875, 0, -0.25, 0.625, -0.875, 0.6328125, 0.8671875,], // W
      [-0.625, 0.875, 0.625, -0.875, 0, 0, -0.625, -0.875, 0.6328125, 0.8671875,], // X
      [-0.625, 0.875, 0, 0.25, 0.625, 0.875, 0, 0.25, 0.0078125, -0.8671875,], // Y
      [-0.6171875, 0.8671875, 0.625, 0.875, -0.625, -0.875, 0.625, -0.875,], // Z

      [-0.0625, -0.3125, -0.171875, -0.421875, -0.171875, -0.578125, -0.0625,
      -0.6875, 0.0625, -0.6875, 0.171875, -0.5625, 0.171875, -0.421875,
        0.0625, -0.3125, -0.0625, -0.3125,], // . array #36 ASCII #46
      [-0.5, 0.125, 0.5, 0.125, 0.5078125, -0.1171875, -0.5, -0.125,
      -0.5, 0.125,], // - array #37 ASCII #45
      [-0.046875, 0.796875, -0.125, 0.875, -0.875, 0, -0.125, -0.875,
      -0.046875, -0.796875, -0.75, 0, -0.046875, 0.796875,], // array #38 ASCII #60
      [0.046875, 0.796875, 0.125, 0.875, 0.875, 0, 0.125, -0.875,
        0.046875, -0.796875, 0.75, 0, 0.046875, 0.796875,],// array #39 ASCII #62
    ];

  color: u32 = 0xff_ff_ff_ff;
  rotation: f32 = 0.0;

  private index: u32 = 0;

  @inline public render(): void {
    // don't render if this is a space
    if (this.index == Char.SPACE) {
      return;
    }
    renderLine(this.charData[this.index],
      this.x, this.y, this.color, this.rotation, this.scale);
  }

  @inline set num(d: u32) {

    if (d > 9) {
      return;
    }

    this.index = d;
  }

  @inline get num(): u32 {
    return this.index;
  }

  @inline set char(c: string) {
    this.charCode = <u32>c.charCodeAt(0);
  }

  @inline set charCode(cc: u32) {
    this.index = Char.charCodeToIndex(cc);
  }

  @inline static charCodeToIndex(cc: u32): u32 {
    if (cc >= 48 && cc <= 57) {
      return cc - 48;
    }
    else if (cc >= 65 && cc <= 90) {
      return cc - 55;
    }
    else if (cc >= 97 && cc <= 122) {
      return cc - 87;
    }
    else if (cc == 46) {
      return 36;
    }
    else if (cc == 45) {
      return 37;
    }
    else if (cc == 60) {
      return 38;
    }
    else if (cc == 62) {
      return 39;
    }
    return Char.SPACE; // space for everything undefined
  }

}