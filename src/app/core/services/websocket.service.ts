import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket;
  private messages$: Subject<any> = new Subject<any>();
  private messageQueue: any[] = [];
  private isConnected: boolean = false;

  constructor() {
    this.socket = new WebSocket('wss://webquotes.geeksoft.pl/websocket/quotes');

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messages$.next(data);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.isConnected = true;
      this.flushMessageQueue();
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
    };
  }

  sendMessage(message: any): void {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  getMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  subscribe(symbols: string[]): void {
    this.sendMessage({ p: '/subscribe/addlist', d: symbols });
  }

  unsubscribe(symbols: string[]): void {
    this.sendMessage({ p: '/subscribe/removelist', d: symbols });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.socket.send(JSON.stringify(message));
    }
  }
}
