import { Component, computed, inject, signal } from '@angular/core';

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

  // Computed signals derivati dalla configurazione
  protected readonly config = this.configService.config;
  protected readonly loading = this.configService.loading;
  protected readonly error = this.configService.error;

  // Computed signals per i singoli valori
  protected readonly loaded = computed(() => this.config() !== null);
  protected readonly appName = computed(() => this.config()?.appName ?? '');
  protected readonly apiBaseUrl = computed(() => this.config()?.apiBaseUrl ?? '');

  constructor() {
    // Niente da fare nel constructor - tutto gestito dai signals!
    console.log('📱 ConfigComponent initialized');
  }

}