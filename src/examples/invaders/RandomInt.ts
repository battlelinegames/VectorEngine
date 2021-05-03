// This is a poor quality RNG
// probably good enough for old arcade games
// this will have a high end range bias
export class RandomInt {
  private static N: u32 = 2251860089; // large prime
  private static M: u32 = 2301907879; // large prime
  private static MIN: i32 = 0;
  private static MAX: i32 = 9;


  static NEXT(): i32 {
    let shift_n: u32 = (RandomInt.M & 0b1111) + 13;
    let shift_m: u32 = (RandomInt.N & 0b1111) + 11;
    RandomInt.N = rotl<u32>(RandomInt.N, shift_n);
    RandomInt.M = rotl<u32>(RandomInt.M, shift_m);
    let range: i32 = RandomInt.MAX - RandomInt.MIN;
    // + below should be xor, but can't find AS xor
    let r: i32 = (RandomInt.N ^ RandomInt.M) % range;
    r += RandomInt.MIN;
    return r;
  }

  static RANGE(min: i32, max: i32): i32 {
    if (max < min) {
      RandomInt.MIN = max;
      RandomInt.MAX = min;
    }
    else {
      RandomInt.MIN = min;
      RandomInt.MAX = max;
    }
    return RandomInt.NEXT();
  }
}