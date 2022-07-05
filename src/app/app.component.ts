import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { NgxChessBoardComponent, PieceIconInput } from 'ngx-chess-board';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('board', { static: false }) cmpt: NgxChessBoardComponent;

  private $destroyed = new Subject<void>();

  constructor(@Inject(WINDOW) readonly windowRef: Window) { }

  ngOnInit(): void {
    const size = this.windowRef.innerWidth > this.windowRef.innerHeight
      ? this.windowRef.innerHeight
      : this.windowRef.innerWidth;
    this.size = size - 120;
  }

  ngAfterViewInit(): void {
    console.debug(this.cmpt);

    this.cmpt.moveChange.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(move => {
      console.debug(move);
    });

    this.cmpt.checkmate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe();

    this.cmpt.stalemate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe();
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
