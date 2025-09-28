import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import ConfigComponent from '../../core/config/config.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    ConfigComponent,
    DatePipe,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class Home {
  currentDate = new Date();
}
