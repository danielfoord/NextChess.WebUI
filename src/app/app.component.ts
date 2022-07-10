import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { WINDOW } from '@ng-web-apis/common';
import { MoveChange, NgxChessBoardComponent, PieceIconInput } from 'ngx-chess-board';
import { Subject, takeUntil } from 'rxjs';
import { GameStore } from './game.store';
import { PieceIconsService } from './piece-icons.service';
import { StockfishService } from './stockfish.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [GameStore]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('board', { static: false }) boardRef: NgxChessBoardComponent;
  @ViewChild('darkModeToggle', { static: false }) darkModeToggleRef: MatSlideToggle;
  @ViewChild('boardContainer', { static: true }) boardContainerRef: ElementRef<HTMLElement>;
  @ViewChild('resignDialog', { static: false }) resignDialogRef: TemplateRef<HTMLElement>;

  private $destroyed = new Subject<void>();

  moves$ = this.gameStore.moves$;
  hasGameStarted$ = this.gameStore.hasGameStarted$;

  size = 600;

  boardPadding = 30;

  pieceIcons: PieceIconInput = this.pieceIconsService.getIcons();

  playerColor = new FormControl(this.gameStore.getPlayerColor());

  constructor(
    @Inject(WINDOW) readonly windowRef: Window,
    readonly themeService: ThemeService,
    private readonly pieceIconsService: PieceIconsService,
    private readonly stockfishService: StockfishService,
    private readonly gameStore: GameStore,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const size = (this.windowRef.innerWidth - 300) > (this.windowRef.innerHeight - 64)
      ? this.windowRef.innerHeight - 64
      : this.windowRef.innerWidth - 300
    this.size = size - (this.boardPadding * 2);

    this.stockfishService.onMove.pipe(
      takeUntil(this.$destroyed)
    ).subscribe((move) => this.handleMoveFromEngine(move));

    this.stockfishService.onReady.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.info('ENGINE READY'));

    this.stockfishService.onUciCheckOk.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.info('UCI CHECK OK'));

    this.stockfishService.onCheckMate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.info('CHECKMATE GG'));

    this.themeService.initialize();
    this.stockfishService.initialize();
  }

  ngAfterViewInit(): void {

    this.boardRef.moveChange.pipe(
      takeUntil(this.$destroyed)
    ).subscribe((evt: MoveChange) => {
      this.gameStore.makeMove((evt as any).move);
      this.stockfishService.go(this.gameStore.getMoves());
    });

    this.boardRef.checkmate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.debug('CHECKMATE'));

    this.boardRef.stalemate.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.debug('STALEMATE'));

    this.darkModeToggleRef.change.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => this.themeService.toggle());
  }

  ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: UIEvent) {
    const size = this.boardContainerRef.nativeElement.clientWidth > this.boardContainerRef.nativeElement.clientHeight
      ? this.boardContainerRef.nativeElement.clientHeight
      : this.boardContainerRef.nativeElement.clientWidth;
    this.size = size - (this.boardPadding * 2);
  }

  startNewGame() {
    if (!this.playerColor) {
      return;
    }

    this.gameStore.startNewGame({ 
      playerColor: this.playerColor.value as 'white' | 'black'
    });

    if (this.playerColor.value === 'black') {
      this.boardRef.reverse();
    }

    this.stockfishService.go(this.gameStore.getMoves());
  }

  showResignDialog() {
    this.dialog.open(this.resignDialogRef);
  }

  resign() {
    this.gameStore.resetGame();
    this.boardRef.reset();
  }

  private handleMoveFromEngine(move: { bestMove: string, ponder: string }) {
    if (!this.gameStore.getIsUsersTurn()) {
      this.boardRef.move(move.bestMove);
    }
  }
}
