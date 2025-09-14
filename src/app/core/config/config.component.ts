import { Component, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ConfigService } from './config.service';

@Component({
  selector: 'app-config',
  imports: [],
  templateUrl: './config.component.html',
  styles: ``
})
export default class ConfigComponent {

  private configService = inject(ConfigService);

  // Utilizzo di signals per maggior efficienza in Zoneless
  loaded = signal(false);
  appName = signal('');
  apiBaseUrl = signal('');

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.loaded.set(true);
        this.appName.set(config.appName);
        this.apiBaseUrl.set(config.apiBaseUrl);
      }
    });
  }

  ngOnInit() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    if (config) {
      this.loaded.set(true);
      this.appName.set(config.appName);
      this.apiBaseUrl.set(config.apiBaseUrl);
    }
  }

}