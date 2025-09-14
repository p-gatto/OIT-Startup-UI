import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

import { ConfigService } from './app/core/config/config.service';

/* bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err)); */

// Bootstrap moderno con precaricamento configurazione
async function bootstrap() {
  try {
    // 1. Avvia l'applicazione
    const appRef = await bootstrapApplication(App, appConfig);

    // 2. Ottieni il servizio di configurazione dall'injector
    const configService = appRef.injector.get(ConfigService);

    // 3. Carica la configurazione
    await configService.loadConfig();

    console.log('Application bootstrapped successfully with config loaded');
    return appRef;
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    throw error;
  }
}

bootstrap().catch(err => console.error('Bootstrap error:', err));