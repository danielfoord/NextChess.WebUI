import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  isDarkMode: boolean = false;

  ligtModeDarkSquareColor = '#2979ff';
  darkModeDarkSqaureColor = '#9c27b0';

  ligtModeLightSquareColor = '#fefefe';
  darkModeLightSqaureColor = '#c3c3c3';

  constructor(
    @Inject(LOCAL_STORAGE) private readonly storage: Storage,
    @Inject(DOCUMENT) private readonly document: Document) { }

  get boardLightSquareColor() {
    return this.isDarkMode ? this.darkModeLightSqaureColor : this.ligtModeLightSquareColor;
  }

  get boardDarkSquareColor() {
    return this.isDarkMode ? this.darkModeDarkSqaureColor : this.ligtModeDarkSquareColor;
  }

  initialize() {
    if (this.storage.getItem('darkMode') === 'true') {
      this.isDarkMode = true;
      this.document.querySelector('body')?.classList.toggle('dark-theme');
    }
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    this.storage.setItem('darkMode', `${this.isDarkMode}`);
    this.document.querySelector('body')?.classList.toggle('dark-theme');
  }
}
