import { Input } from '../../engine/Input';
import { Char } from '../../engine/Char';
import { logf32, logi32 } from '../../engine/index';
import { DisplayString } from '../../engine/DisplayString';
import { Shot } from './Shot';
import { Bomb } from './Bomb';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { InvaderSmall } from './InvaderSmall';
import { InvaderMed } from './InvaderMed';
import { InvaderWide } from './InvadersWide';
import { InvaderObj } from './InvaderObj';
import { RandomInt } from './RandomInt';
import { playDieSnd, playDownSnd, playKillSnd, playShotSnd, playUpSnd } from './sound';

const ANIMATION_START: i32 = 825;
export var DELTA_MS: i32 = 0; // millisecond delta
export var DELTA_S: f32 = 0; // second delta
export var ANIMATION_MS: i32 = ANIMATION_START;
export var TIME_MS: i32 = 0;

export var INVADER_POOL: StaticArray<InvaderObj> = new StaticArray<InvaderObj>(50);
export var SHOT_POOL: StaticArray<Shot> = new StaticArray<Shot>(20);
export var BOMB_POOL: StaticArray<Bomb> = new StaticArray<Bomb>(40);

for (let i: i32 = 0; i < SHOT_POOL.length; i++) {
  SHOT_POOL[i] = new Shot();
}

for (let i: i32 = 0; i < BOMB_POOL.length; i++) {
  BOMB_POOL[i] = new Bomb();
}

export var GAME_STARTED: bool = false;
let invader_x: f32 = -0.7;
let invader_y: f32 = 0.8;
const X_SPACE: f32 = 0.15;

for (let i: i32 = 0; i < 10; i++) {
  INVADER_POOL[i] = new InvaderSmall();
  INVADER_POOL[i].x = invader_x;
  INVADER_POOL[i].y = invader_y;
  invader_x += X_SPACE;
}

invader_x = -0.7;
invader_y = 0.7;

for (let i: i32 = 10; i < 20; i++) {
  INVADER_POOL[i] = new InvaderMed();
  INVADER_POOL[i].x = invader_x;
  INVADER_POOL[i].y = invader_y;
  invader_x += X_SPACE;
}

invader_x = -0.7;
invader_y = 0.6;

for (let i: i32 = 20; i < 30; i++) {
  INVADER_POOL[i] = new InvaderWide();
  INVADER_POOL[i].x = invader_x;
  INVADER_POOL[i].y = invader_y;
  invader_x += X_SPACE;
}

invader_x = -0.7;
invader_y = 0.5;

for (let i: i32 = 30; i < 40; i++) {
  INVADER_POOL[i] = new InvaderMed();
  INVADER_POOL[i].x = invader_x;
  INVADER_POOL[i].y = invader_y;
  INVADER_POOL[i].frame = 1;
  invader_x += X_SPACE;
}

invader_x = -0.7;
invader_y = 0.4;

for (let i: i32 = 40; i < 50; i++) {
  INVADER_POOL[i] = new InvaderWide();
  INVADER_POOL[i].x = invader_x;
  INVADER_POOL[i].y = invader_y;
  INVADER_POOL[i].frame = 1;
  invader_x += X_SPACE;
}

Input.init();
RandomInt.RANGE(0, 47);
var invaderIndex: i32 = RandomInt.NEXT();

export var PLAYER: Player = new Player();

var shotIndex: i32 = 0;
export function shoot(): void {
  let count: i32 = 0;
  if (ANIMATION_MS > 400) {
    playShotSnd();
  }
  while (count++ < SHOT_POOL.length) {
    shotIndex++;
    if (shotIndex >= SHOT_POOL.length) {
      shotIndex = 0;
    }

    if (SHOT_POOL[shotIndex].active == false) {
      SHOT_POOL[shotIndex].launch(PLAYER.x);
      break;
    }
  }
}

var bombIndex: i32 = 0;
var bcount: i32 = 0;
export function dropBomb(x: f32, y: f32): void {
  if (GAME_STARTED == false) {
    return;
  }

  if (bcount < 5) {
    bcount++;
    return;
  }
  bcount = 0;

  let count: i32 = 0;
  BOMB_POOL[bombIndex++].activate(x, y);

  if (bombIndex >= BOMB_POOL.length) {
    bombIndex = 0;
  }

  while (count++ < BOMB_POOL.length) {
    bombIndex++;
    if (bombIndex >= BOMB_POOL.length) {
      bombIndex = 0;
    }

    if (BOMB_POOL[bombIndex].active == false) {
      BOMB_POOL[bombIndex].activate(x, y);
      break;
    }
  }
}

var altUp: bool = true;

export var MSG: DisplayString = new DisplayString("AssemblyScript Invaders", 0, 0.95, 0.035, 0xff_ff_00_ff);
var START_GAME_MSG: DisplayString = new DisplayString("<CLICK TO START>", 0.0, 0.0, 0.04, 0xff_ff_00_ff);
export function gameLoop(delta: i32): void {
  DELTA_MS = delta;
  DELTA_S = <f32>delta / 1000.0;
  TIME_MS += delta;
  let reverse: bool = false;

  if (
    GAME_STARTED == false && (
      Input.MouseLeftButton == true ||
      Input.MouseRightButton == true ||
      Input.MouseMiddleButton == true)) {
    GAME_STARTED = true;
    PLAYER.active = true;
    PLAYER.x = 0.0;
  }

  if (TIME_MS >= ANIMATION_MS) {
    if (GAME_STARTED) {
      if (altUp == true) {
        playUpSnd();
      }
      else {
        playDownSnd();
      }
    }
    altUp = !altUp;

    for (let i: i32 = 0; i < 50; i++) {
      INVADER_POOL[i].move();
      if (INVADER_POOL[i].active == true && reverse == false &&
        ((INVADER_POOL[i].x >= 1.0 && InvaderObj.MOV > 0.0) ||
          (INVADER_POOL[i].x <= -1.0 && InvaderObj.MOV < 0.0))) {
        reverse = true;
      }
    }

    let escapeCount: i32 = 0;
    invaderIndex = RandomInt.NEXT();  // LOW QUALITY RNG
    while (INVADER_POOL[invaderIndex].active == false &&
      escapeCount++ < 50) {
      if (++invaderIndex >= INVADER_POOL.length) {
        invaderIndex = 0;
      }

    }
    if (INVADER_POOL[invaderIndex].active == true) {
      dropBomb(INVADER_POOL[invaderIndex].x, INVADER_POOL[invaderIndex].y - 0.03);
    }
    TIME_MS = 0;
  }

  if (reverse) {
    InvaderObj.MOV = -InvaderObj.MOV;
    for (let i: i32 = 0; i < 50; i++) {
      INVADER_POOL[i].y -= 0.05;
      INVADER_POOL[i].x += InvaderObj.MOV;
    }
  }

  for (let i: i32 = 0; i < 50; i++) {
    INVADER_POOL[i].render();
  }

  for (let i: i32 = 0; i < SHOT_POOL.length; i++) {
    SHOT_POOL[i].move();
    SHOT_POOL[i].render();

    if (SHOT_POOL[i].active) {
      for (let j: i32 = 0; j < INVADER_POOL.length; j++) {
        if (INVADER_POOL[j].active && SHOT_POOL[i].hitTest(INVADER_POOL[j])) {
          ANIMATION_MS -= 16;
          SHOT_POOL[i].active = false;
          INVADER_POOL[j].active = false;
          playKillSnd();
          // SHOW EXPLOSION
        }
      }
    }
  }

  for (let i: i32 = 0; i < BOMB_POOL.length; i++) {
    BOMB_POOL[i].move();
    BOMB_POOL[i].render();

    if (BOMB_POOL[i].active && PLAYER.active &&
      BOMB_POOL[i].hitTest(PLAYER)) {
      BOMB_POOL[i].active = false;
      PLAYER.active = false;
      playDieSnd();
      invaderReset(false);
      // SHOW EXPLOSION
    }
  }


  MSG.render();
  PLAYER.move();
  PLAYER.render();

  if (GAME_STARTED == false) {
    START_GAME_MSG.render();
  }

  let you_win: bool = true;
  for (let i: i32 = 0; i < INVADER_POOL.length; i++) {
    if (INVADER_POOL[i].active == true && INVADER_POOL[i].y < -0.8) {
      invaderReset(false);
      playKillSnd();
      return;
    }
    if (INVADER_POOL[i].active == true) {
      you_win = false;
      break;
    }
  }

  if (you_win) {
    invaderReset(you_win);
  }
}

function invaderReset(win: bool): void {
  GAME_STARTED = false;
  ANIMATION_MS = ANIMATION_START;
  if (win) {
    START_GAME_MSG.overwrite("     you win     ");
  }
  else {
    START_GAME_MSG.overwrite("    game over    ");
  }

  for (let i: i32 = INVADER_POOL.length - 1; i >= 0; i--) {
    INVADER_POOL[i].activate(-0.7 + <f32>(i % 10) * X_SPACE,
      invader_y + <f32>(i / 10) * 0.1);
  }

  for (let i: i32 = 0; i < BOMB_POOL.length; i++) {
    BOMB_POOL[i].active = false;
  }

  for (let i: i32 = 0; i < SHOT_POOL.length; i++) {
    SHOT_POOL[i].active = false;
  }
}