import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastEvent } from './toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toastEvents$ = new Subject<ToastEvent[]>();
  public toastEvents$: Observable<ToastEvent[]> = this._toastEvents$.asObservable();

  private activeToasts: ToastEvent[] = [];

  public showToast(toast: ToastEvent): void {
    this.activeToasts.push(toast);
    this._toastEvents$.next(this.activeToasts);
    const index = this.activeToasts.length - 1;

    setTimeout(() => {
      this.removeToast(index);
    }, 1000);
  }

  public removeToast(index: number): void {
    this.activeToasts.splice(index, 1);
    this._toastEvents$.next(this.activeToasts);
  }
}
