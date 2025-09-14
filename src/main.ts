import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

import { ConfigService } from './app/core/config/config.service';

/* bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err)); */

// Bootstrap con precaricamento configurazione
async function bootstrap() {
  const app = await bootstrapApplication(App, appConfig);
  const configService = app.injector.get(ConfigService);
  await configService.loadConfig();
  return app;
}

bootstrap().catch(err => console.error(err));