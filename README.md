# VectorEngine

VectorEngine is an [AssemblyScript](https://assemblyscript.org) & [WebAssembly](https://webassembly.org) vector rendering engine.  I designed it with the goal of making a super simple rendering engine that can be used by anyone to write WebAssembly games using AssemblyScript.  Tutorials are available on [wasmbook.com](https://wasmbook.com).  

## Tutorials
- [Vector Engine Into Video Tutorial](https://wasmbook.com/blog/AssemblyScriptVEVTutorial)
- [Vector Engine Intro](https://wasmbook.com/blog/VectorEngine)
- [AssemblyScript Class Tutorial](https://wasmbook.com/blog/VectorEngineClasses)
- [Mouse Input Tutorial](https://wasmbook.com/blog/VectorEngineMouse)
- [Keyboard Input Tutorial](https://wasmbook.com/blog/AssemblyScriptVEKeyboard)

## Example Games
- [AssemblyScript / WebAssembly Tempest](https://wasmbook.com/prologue/)
- [AssemblyScript / WebAssembly Invaders](https://wasmbook.com/apps/invaders/)
- [AssemblyScript / WebAssembly Ping Pong](https://wasmbook.com/pong/pong.html)

You can install VectorEngine using npm:

```
npm i vectorengine
```

## HTML usage

Here's an example of the HTML code you would use with VectorEngine:
```html
  <html>

    <head>
      <style>
        body {
          background-color: #3b3b3b;
          text-align: center;
        }
      </style>

    </head>

    <body>
      <canvas width="640" height="640" id="cnvs"></canvas>
      <script type="module">
        import { runVectorGame } from "https://unpkg.com/vectorengine/lib/VectorEngine.js";

        runVectorGame("cnvs", "helloworld.wasm", "gameLoop");
      </script>
    </body>

    </html>
```

## AssemblyScript usage

The AssemblyScript renders loops or text as vectors.  Here is some code:

```ts
  import { DisplayString, renderLoop } from 'vectorengine';
  // /vectorengine/lib/vectorengine.ts';

  let x: f32 = 0.0;
  let y: f32 = 0.3;
  let scale: f32 = 0.04;
  let yellow: u32 = 0xff_ff_00_ff;
  const helloWorld = new DisplayString("Hello Vector Engine", x, y, scale, yellow);

  const heartLoop: StaticArray<f32> = [
    // x, y
    0, 0.4375, // first point
    0.125, 0.625, // second point
    0.2578125, 0.7421875, // third point...
    0.375, 0.796875,
    0.5, 0.796875,
    0.625, 0.75,
    0.7578125, 0.6171875,
    0.875, 0.375,
    0.875, 0.125,
    0.75, -0.125,
    0, -0.875,
    -0.75, -0.125,
    -0.875, 0.125,
    -0.875, 0.375,
    -0.7421875, 0.6171875,
    -0.625, 0.75,
    -0.5, 0.796875,
    -0.375, 0.796875,
    -0.25, 0.75,
    -0.125, 0.625,];

  let timeChange: f32 = 0.0; // ADD THIS LINE

  export function gameLoop(delta: i32): void {

    timeChange += <f32>delta / 1000.0; // ADD THIS LINE

    helloWorld.render();

    const scale: f32 = (Mathf.sin(timeChange * 18) + 1.05) / 50.0 + 0.2; // CHANGE LINE
    const x: f32 = 0.0;
    const y: f32 = -0.2;
    const rotation: f32 = 0.0;
    const red: u32 = 0xff_00_00_ff;
    renderLoop(heartLoop, x, y, red, rotation, scale);
  }
```

## The Application

The app that is generated displays the following, with an animated beating heart:

![VectorEngine AssemblyScript application](https://wasmbook.com/images/HelloWorldScreenShot.png)

You can see what the app looks like when it is running here:

[Beating heart VectorEngine app](https://wasmbook.com/apps/helloheart/)

If you have any questions, you can contact me on the following social media:

twitter: [@battagline](https://twitter.com/battagline)<br>
linkedin: [linkedin.com/in/battagline](https://linkedin.com/in/battagline)<br>
assemblyscript discord: [@battagline](https://discord.gg/assemblyscript)<br>
 
Or read AssemblyScript Tutorials on [wasmbook.com](https://wasmbook.com)