import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  onLinkClick(type: string) {
    switch (type) {
      case 'privacy':
        console.log('Privacy Policy clicked');
        break;
      case 'terms':
        console.log('Terms of Service clicked');
        break;
      case 'contact':
        console.log('Contact clicked');
        break;
    }
  }

}