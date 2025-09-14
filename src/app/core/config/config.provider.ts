// 2. Provider function per il bootstrap dell'applicazione
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ConfigService } from './config.service';

export function provideConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ConfigService,
      useFactory: () => {
        const configService = new ConfigService();
        // Prefetch configuration
        configService.loadConfig().catch(err => console.error('Failed to load config', err));
        return configService;
      }
    }
  ]);
}