import { logi32, logf32, mouseX, mouseY } from './index';
import { ClickableGameObject } from './ClickableGameObject';

@external("env", "setInputPtrs")
declare function setInputPtrs(keyboard_ptr: usize,
	mouse_down_ptr: usize, mouse_up_ptr: usize,
	mouse_x_ptr: usize, mouse_y_ptr: usize): void;

export enum KEY {
	BACKSPACE = 8, TAB = 9, ENTER = 13,
	SHIFT = 16, CTRL = 17, ALT = 18, CAPS = 20,
	ESC = 27, SPACE = 32, MINUS = 45,
	LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40,
	NUM0 = 48, NUM1 = 49, NUM2 = 50,
	NUM3 = 51, NUM4 = 52, NUM5 = 53,
	NUM6 = 54, NUM7 = 55, NUM8 = 56, NUM9 = 57,
	A = 65, B = 66, C = 67, D = 68, E = 69, F = 70, G = 71, H = 72, I = 73,
	J = 74, K = 75, L = 76, M = 77, N = 78, O = 79, P = 80, Q = 81, R = 82,
	S = 83, T = 84, U = 85, V = 86, W = 87, X = 88, Y = 89, Z = 90,
}

var count: i32 = 0;

export class Input {
	public static canvasWidth: i32 = 0;
	public static canvasHeight: i32 = 0;

	public static inputMemorySize: usize = 256;
	public static keyInputSize: usize = 100;
	public static inputMemoryAddress: usize = 0;
	public static keyAddress: usize = 0;

	public static mouseDownAddress: usize = 0;
	public static mouseUpAddress: usize = 0;

	public static mouseXAddress: usize = 0;
	public static mouseYAddress: usize = 0;

	public static KeyArray: StaticArray<bool> = new StaticArray<bool>(100);


	private static _clickableCount: u32 = 0;
	private static _ClickableArray: StaticArray<ClickableGameObject> = new StaticArray<ClickableGameObject>(1024);

	public static get MouseX(): f32 {
		return 2.0 * (<f32>(load<i32>(Input.mouseXAddress)) / <f32>Input.canvasWidth) - 1.0;
	}
	public static get MouseY(): f32 {
		return -2.0 * (<f32>(load<i32>(Input.mouseYAddress)) / <f32>Input.canvasHeight) + 1.0;
	}


	public static get MouseLeftButton(): bool {
		return load<bool>(Input.mouseDownAddress);
	}
	public static get MouseRightButton(): bool {
		return load<bool>(Input.mouseDownAddress + 2);
	}
	public static get MouseMiddleButton(): bool {
		return load<bool>(Input.mouseDownAddress + 1);
	}


	public static GetKey(k: KEY): bool {
		const i: i32 = <i32>k + <i32>Input.keyAddress;
		return load<bool>(i);
	}

	public static init(): void {
		/*
		Input.canvasWidth = 640;
		Input.canvasHeight = 640;
		*/
		Input.inputMemoryAddress = heap.alloc(Input.inputMemorySize);

		Input.keyAddress = Input.inputMemoryAddress;

		Input.mouseDownAddress = Input.inputMemoryAddress + Input.keyInputSize;
		Input.mouseUpAddress = Input.inputMemoryAddress + Input.keyInputSize + 3;

		Input.mouseXAddress = Input.inputMemoryAddress + Input.keyInputSize + 8;
		Input.mouseYAddress = Input.inputMemoryAddress + Input.keyInputSize + 12;

		if (Input.mouseXAddress % 4 != 0) {
			Input.mouseXAddress += Input.mouseXAddress % 4;
			Input.mouseYAddress += Input.mouseXAddress % 4;
		}

		setInputPtrs(Input.keyAddress,
			Input.mouseDownAddress,
			Input.mouseUpAddress,

			Input.mouseXAddress, Input.mouseYAddress)
	}

}

