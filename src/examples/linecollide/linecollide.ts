import { Vector } from './vector';
import { DisplayString, Input, renderLine, renderLoop, VectorEngine } from '../../engine/index'

export { VectorEngineExports } from '../../engine/index';
VectorEngine.init();

const handleArray: StaticArray<Vector> = [
  new Vector(-0.5, -0.5),
  new Vector(0.5, 0.5),
  new Vector(0.5, -0.5),
  new Vector(-0.5, 0.5),
];

const red: u32 = 0xff_00_00_ff;
const green: u32 = 0x00_ff_00_ff;
const yellow: u32 = 0xff_ff_00_ff;
const white: u32 = 0xff_ff_ff_ff;
const blue: u32 = 0x99_99_ff_ff;
const purple: u32 = 0xff_00_ff_ff;

const handleLoop: StaticArray<f32> = [
  -0.02, -0.02,
  0.02, -0.02,
  0.02, 0.02,
  -0.02, 0.02,
]

const line1: StaticArray<f32> = [
  -1, -1,
  1, 1,
];

const line2: StaticArray<f32> = [
  -1, 1,
  1, -1,
]

var dragIndex: i32 = -1;

function mouseDownCheck(): i32 {
  for (let i: i32 = 0; i < handleArray.length; i++) {
    if (Mathf.abs(handleArray[i].x - Input.MouseX) < 0.05 &&
      Mathf.abs(handleArray[i].y - Input.MouseY) < 0.05) {
      return i;
    }
  }
  return -1;
}

var directionA: Vector = new Vector();
var directionB: Vector = new Vector();
var distancePoint1: Vector = new Vector();
var distancePoint2: Vector = new Vector();
var rotatedDirection: Vector = new Vector();

function segmentTest(SegmentBegin: Vector, SegmentEnd: Vector,
  LineBegin: Vector, LineEnd: Vector
): bool {
  directionA.copy(SegmentEnd);
  directionA.subtract(SegmentBegin);

  if (directionA.x == 0 && directionA.y == 0) {
    return false;
  }

  directionB.copy(SegmentEnd);
  distancePoint1.copy(SegmentBegin)
  distancePoint2.copy(SegmentBegin)

  distancePoint1.subtract(LineBegin)
  distancePoint2.subtract(LineEnd)

  rotatedDirection.copy(directionA);
  rotatedDirection.rotate90();

  if (rotatedDirection.dot(distancePoint1) * rotatedDirection.dot(distancePoint2) > 0) {
    return false;
  }

  directionB.subtract(LineBegin);

  if (directionA.x == 0 && directionA.y == 0) {
    return false;
  }

  distancePoint1.copy(LineBegin);
  distancePoint1.subtract(SegmentBegin);

  distancePoint2.copy(LineBegin);
  distancePoint2.subtract(SegmentEnd);

  rotatedDirection.copy(directionB);
  rotatedDirection.rotate90();

  if (rotatedDirection.dot(distancePoint1) * rotatedDirection.dot(distancePoint2) > 0) {
    return false;
  }

  return true;
}

function lineCollision(): bool {
  return segmentTest(handleArray[0], handleArray[1],
    handleArray[2], handleArray[3]) &&
    segmentTest(handleArray[2], handleArray[3],
      handleArray[0], handleArray[1]);
}

export function gameLogic(delta: i32): void {

  let mouse_down: bool = Input.MouseLeftButton;

  if (dragIndex == -1 && mouse_down) {
    dragIndex = mouseDownCheck();
  }

  if (mouse_down == false) {
    dragIndex = -1;
  }

  if (dragIndex != -1 && mouse_down) {
    handleArray[dragIndex].x = Input.MouseX;
    handleArray[dragIndex].y = Input.MouseY;
  }

  line1[0] = handleArray[0].x;
  line1[1] = handleArray[0].y;
  line1[2] = handleArray[1].x;
  line1[3] = handleArray[1].y;

  line2[0] = handleArray[2].x;
  line2[1] = handleArray[2].y;
  line2[2] = handleArray[3].x;
  line2[3] = handleArray[3].y;

  let collision: bool = lineCollision();

  renderLine(line1, 0.0, 0.0, collision ? red : green, 0.0, 1.0);
  renderLine(line2, 0.0, 0.0, collision ? red : green, 0.0, 1.0);

  renderLoop(handleLoop, handleArray[0].x, handleArray[0].y, yellow, 0.0, 1.0);
  renderLoop(handleLoop, handleArray[1].x, handleArray[1].y, yellow, 0.0, 1.0);

  renderLoop(handleLoop, handleArray[2].x, handleArray[2].y, blue, 0.0, 1.0);
  renderLoop(handleLoop, handleArray[3].x, handleArray[3].y, blue, 0.0, 1.0);
}