import { AI } from './AI';
import { Ball } from './Ball';
import { Player } from './Player';
import { Input } from '../../engine/Input';
import { Char } from '../../engine/Char';
import { logf32, logi32 } from '../../engine/VectorEngine';
import { bounceSound } from './sounds';
import { DisplayString } from '../../engine/DisplayString';

const ball = new Ball();
const player = new Player();
const ai = new AI(ball);
const helloWorld = new DisplayString("AssemblyScript", 0.0, 0.0, 0.05, 0xff_ff_00_ff);

export const d1 = new Char();
d1.y = 0.5;
d1.scale = 0.1;
d1.color = 0xff_00_00_ff;

export const d2 = new Char();
d2.y = -0.5;
d2.scale = 0.1;
d2.color = 0x00_ff_00_ff;

Input.init();

export function gameLoop(): void {

  ball.move();
  ai.move();
  player.move();

  if (ball.hitTest(player)) {
    bounceSound();

    let dist = player.x - ball.x;
    let w = player.hw + ball.hw;

    ball.yvel = (0.025 * ((w - abs(dist)) / w));

    if (ball.yvel < 0.005) {
      ball.yvel = 0.005;
    }

    if (dist < 0) {
      ball.xvel = 0.025 - ball.yvel;
    }
    else {
      ball.xvel = ball.yvel - 0.025;
    }

  }
  else if (ball.hitTest(ai)) {
    bounceSound();
    let dist = ai.x - ball.x;
    let w = ai.hw + ball.hw;

    ball.yvel = -(0.025 * ((w - abs(dist)) / w));

    if (ball.yvel > -0.005) {
      ball.yvel = -0.005;
    }

    if (dist < 0) {
      ball.xvel = 0.025 + ball.yvel;
    }
    else {
      ball.xvel = -ball.yvel - 0.025;
    }

  }


  ai.render();
  ball.render();
  player.render();

  d1.render();
  d2.render();

  helloWorld.render();
}