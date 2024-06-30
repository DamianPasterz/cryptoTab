import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APP_CONFIG, AppConfig } from '../config';
import { BaseHttpService } from './base-http.service';
import { DataResponse } from './http.model';

@Injectable({
  providedIn: 'root',
})
export class HttpService extends BaseHttpService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    super();
    HttpService.API_URL = this.config.API_URL || environment.API_URL;
  }

  public getData(): Observable<DataResponse> {
    return this.http.get<DataResponse>(`${HttpService.API_URL}`);
  }
}
