import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private darkTheme = {
    '--primary-bg': 'rgb(42, 56, 71)',
    '--primary-text': 'rgb(198, 210, 219)',
    '--row-bg': 'rgba(14, 15, 26, 0.25)',
    '--row-hover-bg': 'rgba(53, 71, 89, 0.5)',
    '--profit-positive': 'rgb(60, 193, 149)',
    '--profit-negative': 'rgb(249, 76, 76)',
  };

  private lightTheme = {
    '--primary-bg': 'rgb(233, 237, 241)',
    '--primary-text': 'rgb(14, 15, 26)',
    '--row-bg': 'rgb(220, 225, 229)',
    '--row-hover-bg': 'rgb(201, 209, 216)',
    '--profit-positive': 'rgb(60, 193, 149)',
    '--profit-negative': 'rgb(249, 76, 76)',
  };

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initTheme(): void {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark )');
    this.applyTheme(prefersDarkScheme.matches ? this.darkTheme : this.lightTheme);
    prefersDarkScheme.addEventListener('change', (event) => {
      this.applyTheme(event.matches ? this.darkTheme : this.lightTheme);
    });
  }

  applyTheme(theme: { [key: string]: string }): void {
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  }

  toggleTheme(isDarkMode: boolean): void {
    this.applyTheme(isDarkMode ? this.darkTheme : this.lightTheme);
  }
}
