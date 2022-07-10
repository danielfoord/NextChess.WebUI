import { TestBed } from '@angular/core/testing';

import { PieceIconsService } from './piece-icons.service';

describe('PieceIconsService', () => {
  let service: PieceIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
