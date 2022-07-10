import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StockfishService {

  private engine: Worker;

  onReady: EventEmitter<void> = new EventEmitter();
  onUciCheckOk: EventEmitter<void> = new EventEmitter();
  onMove: EventEmitter<{ bestMove: string, ponder: string }> = new EventEmitter();
  onCheckMate: EventEmitter<void> = new EventEmitter();

  constructor() { }

  initialize() {
    var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    this.engine = new Worker(wasmSupported ? 'assets/stockfish/stockfish.wasm.js' : 'assets/stockfish/stockfish.js');

    this.engine.onmessage = ({ data }) => {
      if (data) {
        console.debug(`Stockfish: ${data}`);

        const isReady = /readyok/.test(data);
        const isUciOk = /uciok/.test(data);
        const receivedBestMove = /bestmove \w*/.test(data);
        const receivedCheckmate = /info depth \d+\.{0,1}\d* score mate \d+\.{0,1}\d*/.test(data);

        if (isReady) {
          this.onReady.emit();
        } else if (isUciOk) {
          this.onUciCheckOk.emit();
        } else if (receivedBestMove) {
          this.onMove.emit({
            bestMove: data.split(' ')[1],
            ponder: data.split(' ')[1]
          });
        } else if (receivedCheckmate) {
          this.onCheckMate.emit();
        }
      }
    };

    this.engine.postMessage('isready');
    this.engine.postMessage('uci');
    // this.engine.postMessage('isready');
    // this.engine.postMessage('setoption name Skill Level value 1');
    // this.engine.postMessage('ucinewgame');

    // this.engine.postMessage('uci');
    // this.engine.postMessage('position startpos');
    // this.engine.postMessage('eval');
    // this.engine.postMessage('go');
  }

  go(movesList: string[]) {
    this.engine.postMessage(`position startpos moves ${movesList.reduce((prev, curr) => `${prev} ${curr}`, '')}`);
    this.engine.postMessage('eval');
    this.engine.postMessage('go');
  }
}
