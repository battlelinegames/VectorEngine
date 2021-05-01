// @JairusSW do you want to help me out here?

// The JavaScript needs to be told where the buffer is
/*
@external("env", "setNetworkPtr")
declare function setNetworkPtr(ptr: usize): void;

class Network {
  public static SN: Network;
  public static NULL_MSG: u32 = 0;
  private _buffer: usize;
  private _dataPtr: usize;
  private _bufferSize: usize;

  constructor() {
    // create a singleton
    if (Network.SN == null) {
      this._bufferSize = 1024;
      this._buffer = heap.alloc(this._bufferSize);
      setNetworkPtr(this._buffer);
      Network.SN = this;
    }
  }

  public clearBuffer(): void {
    // clear all memory
    memory.fill(this._buffer, 0, this._bufferSize);
    this._dataPtr = 0;
  }

  @inline getMessageId(): u32 {
    return this.getData<u32>();
  }

  @inline public getOrderNumber(): u32 {
    return this.getData<u32>();
  }

  // GENERICS COULD PROBABLY BE USED HERE
  public getData<T>(): T {
    const message: T = load<T>(this._buffer + this._dataPtr);
    this._dataPtr += 4; // this only works for 32-bit data
    return message;
  }

}


// THIS IS HOW YOU WOULD USE IT:
new Network(); // initialize
const CHANGE_X: u32 = 1;
const CHANGE_Y: u32 = 2;

let x_order: u32 = 0;
let y_order: u32 = 0;

function gameLoop(): void {
  let message: u32 = 0;
  do {
    message = Network.SN.getMessageId();
    let order: u32 = 0;
    if (CHANGE_X == message) {
      // set the opponent's x position
      order = Network.SN.getOrderNumber();
      let xval: f32 = Network.SN.getData<f32>();
      if (order < x_order) {
        // this message is old, discard it
      }
      else {
        // this is the most recent message with an x value
        // use the xval above to set the opponent x val
      }
    }
    // pong doesn't have a y value, but this is just for deomonstration
    else if (CHANGE_Y == message) {
      // set the opponent's y position
      order = Network.SN.getOrderNumber();
      let yval: f32 = Network.SN.getData<f32>();
      if (order < y_order) {
        // this message is old, discard it
      }
      else {
        // this is the most recent message with an x value
        // use the xval above to set the opponent x val
      }
    }
    else if (Network.NULL_MSG == message) {
      // this is the terminating message, stop reading the buffer;
    }
  } while (message != 0);

  Network.SN.clearBuffer(); // at the end of the game loop clear the buffer
}
*/