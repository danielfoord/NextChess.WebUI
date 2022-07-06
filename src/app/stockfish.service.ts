import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StockfishService {
  
  private engine: Worker;

  constructor() { }
}
