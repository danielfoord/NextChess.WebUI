import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { WINDOW } from '@ng-web-apis/common';
import { MoveChange, NgxChessBoardComponent, PieceIconInput } from 'ngx-chess-board';
import { Subject, takeUntil } from 'rxjs';
import { PieceIconsService } from './piece-icons.service';
import { StockfishService } from './stockfish.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('board', { static: false }) boardRef: NgxChessBoardComponent;
  @ViewChild('darkModeToggle', { static: false }) darkModeToggleRef: MatSlideToggle;

  private $destroyed = new Subject<void>();

  // TODO: This should move to game state
  private moveList: string[] = [];

  // TODO: This should move to game state
  private usersTurn: boolean = true;

  size = 600;

  pieceIcons: PieceIconInput = this.pieceIconsService.getIcons();

  constructor(
    @Inject(WINDOW) readonly windowRef: Window,
    readonly themeService: ThemeService,
    private readonly pieceIconsService: PieceIconsService,
    private readonly stockfishService: StockfishService
  ) { }

  ngOnInit(): void {
    const size = this.windowRef.innerWidth > this.windowRef.innerHeight
      ? this.windowRef.innerHeight
      : this.windowRef.innerWidth;
    this.size = size - 120;

    this.stockfishService.onMove.pipe(
      takeUntil(this.$destroyed)
    ).subscribe((move) => this.handleMoveFromEngine(move));

    this.stockfishService.onReady.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.info('ENGINE READY'));

    this.stockfishService.onUciCheckOk.pipe(
      takeUntil(this.$destroyed)
    ).subscribe(() => console.info('UCI CHECK OK'));

    this.themeService.initialize();
    this.stockfishService.initialize();
  }

  ngAfterViewInit(): void {
    // console.debug(this.boardRef);

    this.boardRef.moveChange.pipe(
      takeUntil(this.$destroyed)
    ).subscribe((evt: MoveChange) => {
      // console.debug(evt);
      // TODO: This should move to game state
      this.moveList.push((evt as any).move);
      this.usersTurn = !this.usersTurn;
      this.stockfishService.go(this.moveList);
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
  onResize(event: UIEvent) {
    const windowRef = event.target as Window;
    const size = windowRef.innerWidth > windowRef.innerHeight
      ? windowRef.innerHeight
      : windowRef.innerWidth;
    this.size = size - 120;
  }

  private handleMoveFromEngine(engineResponse: string) {
    const move = engineResponse.split(' ')[1];
    if (!this.usersTurn) {
      this.boardRef.move(move);
    }
  }
}
