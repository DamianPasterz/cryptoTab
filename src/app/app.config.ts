import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { APP_CONFIG } from '@core/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: APP_CONFIG, useValue: APP_CONFIG },
    importProvidersFrom(HttpClientModule),
  ],
};
