import { Injectable } from '@angular/core';
import { PieceIconInput } from 'ngx-chess-board';

@Injectable({
  providedIn: 'root'
})
export class PieceIconsService {

  getIcons(): PieceIconInput {
    return {
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

}
