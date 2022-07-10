import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable } from "rxjs";

export interface GameState {
  moves: string[];
  isUsersTurn: boolean;
  hasGameStarted: boolean;
  playerColor: 'white' | 'black';
}

interface NewGameConfig {
  playerColor: 'white' | 'black';
}

@Injectable()
export class GameStore extends ComponentStore<GameState> {
  constructor() {
    super({
      hasGameStarted: false,
      isUsersTurn: true,
      moves: [],
      playerColor: 'white'
    })
  }

  readonly moves$: Observable<string[]> = this.select(state => state.moves);

  readonly playerMoves$: Observable<{ white: string[], black: string[] }> = this.select(state => {
    const white: string[] = [];
    const black: string[] = [];
    state.moves.forEach((move, i) => {
      if (i % 2 === 0) {
        white.push(move);
      } else {
        black.push(move);
      }
    });
    return { white, black };
  });

  readonly hasGameStarted$: Observable<boolean> = this.select(state => state.hasGameStarted);
  readonly getMoves = (): string[] => this.get(state => state.moves);
  readonly getIsUsersTurn = (): boolean => this.get(state => state.isUsersTurn);
  readonly getPlayerColor = (): string => this.get(state => state.playerColor);

  readonly makeMove = this.updater((state, move: string) => ({
    ...state,
    moves: [...state.moves, move],
    isUsersTurn: !state.isUsersTurn
  }));

  readonly startNewGame = this.updater((state, config: NewGameConfig) => ({
    ...state,
    hasGameStarted: !state.hasGameStarted,
    playerColor: config.playerColor,
    isUsersTurn: config.playerColor === 'white'
  }));

  readonly resetGame = this.updater(() => ({
    hasGameStarted: false,
    isUsersTurn: true,
    moves: [],
    playerColor: 'white'
  }));
}
