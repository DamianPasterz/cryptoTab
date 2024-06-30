import { InjectionToken } from '@angular/core';

export interface AppConfig {
  API_URL: string;
}
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
