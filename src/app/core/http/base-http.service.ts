import { HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import assign from 'lodash-es/assign';
import { Observable, catchError, throwError } from 'rxjs';

import forIn from 'lodash-es/forIn';

import toString from 'lodash-es/toString';
import { environment } from 'src/environments/environment';

export const enum ErrorTypes {
  HTTP_ERROR = 'HTTP_ERROR',
}

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  static API_URL = environment.API_URL;
  public handleError(err: Error): Observable<never> {
    assign(err, { type: ErrorTypes.HTTP_ERROR });
    return throwError(() => err);
  }

  public handleRequest<T = any>(requestObservable: Observable<T>): Observable<T> {
    return requestObservable.pipe(catchError((err) => this.handleError(err)));
  }

  public parseQueryParams(params: object, encoder?: HttpParameterCodec): HttpParams {
    let queryParams = encoder ? new HttpParams({ encoder }) : new HttpParams();

    forIn(params, (value, key) => {
      if (typeof value !== undefined) {
        queryParams = queryParams.append(key, toString(value));
      }
    });

    return queryParams;
  }
}
