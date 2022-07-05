import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { MoveChange, NgxChessBoardComponent, PieceIconInput } from 'ngx-chess-board';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('board', { static: false }) cmpt: NgxChessBoardComponent;

  private $destroyed = new Subject<void>();

  private engine: Worker;
  
  private moveList: string[] = [];

  constructor(@Inject(WINDOW) readonly windowRef: Window) { }

  ngOnInit(): void {
    const size = this.windowRef.innerWidth > this.windowRef.innerHeight
      ? this.windowRef.innerHeight
      : this.windowRef.innerWidth;
    this.size = size - 120;

    this.engine = new Worker('assets/stockfish/stockfish.js');

    this.engine.onmessage = ({ data }) => {
      if (data) {
        console.log(`Worker: ${data}`);
      }
    };

    this.engine.postMessage('isready');
    this.engine.postMessage('uci');
    this.engine.postMessage('setoption name Skill Level value 20');
    this.engine.postMessage('ucinewgame');
    this.engine.postMessage('position startpos');
    this.engine.postMessage('eval');
    this.engine.postMessage('go');
  }

  ngAfterViewInit(): void {
    console.debug(this.cmpt);

    this.cmpt.moveChange.pipe(
      takeUntil(this.$destroyed)
    ).subscribe((evt: MoveChange) => {
      console.debug(evt);
      this.moveList.push((evt as any).move);
      this.engine.postMessage(`position startpos moves ${this.moveList.reduce((prev, curr) => `${prev} ${curr}`, '')}`);
      this.engine.postMessage('go');
    });

    this.cmpt.checkmate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.debug('CHECKMATE'));

    this.cmpt.stalemate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.debug('STALEMATE'));
  }

  ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const windowRef = event.target as Window;
    const size = windowRef.innerWidth > windowRef.innerHeight
      ? windowRef.innerHeight
      : windowRef.innerWidth;
    this.size = size - 120;
  }

  title = 'next_chess';
  size = 600;

  pieceIcons: PieceIconInput = {
    blackBishopUrl: 'assets/img/bb.png',
    blackKingUrl: 'assets/img/bk.png',
    blackKnightUrl: 'assets/img/bn.png',
    blackPawnUrl: 'assets/img/bp.png',
    blackQueenUrl: 'assets/img/bq.png',
    blackRookUrl: 'assets/img/br.png',
    whiteBishopUrl: 'assets/img/wb.png',
    whiteKingUrl: 'assets/img/wk.png',
    whiteKnightUrl: 'assets/img/wn.png',
    whitePawnUrl: 'assets/img/wp.png',
    whiteQueenUrl: 'assets/img/wq.png',
    whiteRookUrl: 'assets/img/wr.png',
  };
}
