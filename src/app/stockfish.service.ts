import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StockfishService {

  private engine: Worker;

  onReady: EventEmitter<void> = new EventEmitter();
  onMove: EventEmitter<string> = new EventEmitter();

  constructor() { }

  initialize() {
    var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    this.engine = new Worker(wasmSupported ? 'assets/stockfish/stockfish.wasm.js' : 'assets/stockfish/stockfish.js');

    this.engine.onmessage = ({ data }) => {
      if (data) {
        console.debug(`Stockfish: ${data}`);

        const isReady = /readyok/.test(data);
        const receivedBestMove = /bestmove \w*/.test(data);

        if (isReady) {
          this.onReady.emit(data);
        } else if (receivedBestMove) {
          this.onMove.emit(data);
        }
      }
    };

    this.engine.postMessage('isready');
    this.engine.postMessage('uci');
  }

  go(movesList: string[]) {
    this.engine.postMessage(`position startpos moves ${movesList.reduce((prev, curr) => `${prev} ${curr}`, '')}`);
    this.engine.postMessage('eval');
    this.engine.postMessage('go');
  }
}
