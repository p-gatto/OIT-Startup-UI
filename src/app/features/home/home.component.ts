import { Component } from '@angular/core';
import ConfigComponent from '../../core/config/config.component';

@Component({
  selector: 'app-home',
  imports: [
    ConfigComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class Home {

}
