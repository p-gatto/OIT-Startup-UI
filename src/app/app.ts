import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import ConfigComponent from './core/config/config.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ConfigComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('OIT Startup');
}
