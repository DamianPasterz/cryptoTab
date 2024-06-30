import { Injectable, inject } from '@angular/core';
import { Trade, TradeSide, TradeSymbol } from '@core/http/http.model';
import { HttpService } from '@core/http/http.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupedTrades, GroupedUpdateTrades, TradeAggregates, UpdateTrade } from './TradeAggregationService.models';
import { ToastService } from './toast.service';
import { WebSocketService } from './websocket.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class TradeAggregationService {
  private http = inject(HttpService);
  private toastService = inject(ToastService);
  private webSocketService = inject(WebSocketService);

  private _aggregatesData$ = new BehaviorSubject<TradeAggregates[]>([]);
  public aggregatesData$: Observable<TradeAggregates[]> = this._aggregatesData$.asObservable();

  private _detailsData$ = new BehaviorSubject<GroupedUpdateTrades>({});
  public detailsData$: Observable<GroupedUpdateTrades> = this._detailsData$.asObservable();

  private _isExpand$ = new BehaviorSubject<boolean>(false);
  public isExpand$: Observable<boolean> = this._isExpand$.asObservable();

  constructor() {
    this.webSocketService
      .getMessages()
      .pipe(untilDestroyed(this))
      .subscribe((message) => {
        if (message.p === '/quotes/subscribed') {
          this.updatePrices(message.d);
        }
      });
  }

  public getData(): void {
    this.http.getData().subscribe((response) => {
      const groupedTrades = this.groupTrades(response.data);
      const updatedTrades = this.calculateDetailsData(groupedTrades);
      this._detailsData$.next(updatedTrades);
      this.calculateAggregates(updatedTrades);
      this.subscribeToWebSocket(Object.keys(groupedTrades));
    });
  }

  private groupTrades(trades: Trade[]): GroupedTrades {
    return trades.reduce((acc: GroupedTrades, trade: Trade) => {
      const { symbol } = trade;
      if (!acc[symbol]) {
        acc[symbol] = [];
      }
      acc[symbol].push(trade);
      return acc;
    }, {});
  }

  private groupUpdateTrades(trades: UpdateTrade[]): GroupedUpdateTrades {
    return trades.reduce((acc: GroupedUpdateTrades, trade: UpdateTrade) => {
      const { symbol } = trade;
      if (!acc[symbol]) {
        acc[symbol] = [];
      }
      acc[symbol].push(trade);
      return acc;
    }, {});
  }

  private calculateDetailsData(groupedTrades: GroupedTrades): GroupedUpdateTrades {
    const updatedTrades: UpdateTrade[] = [];
    Object.values(groupedTrades).forEach((trades) => {
      trades.forEach((item) => {
        const profit = this.calculateProfit(item, item.closePrice);
        updatedTrades.push({ ...item, profit });
      });
    });
    return this.groupUpdateTrades(updatedTrades);
  }

  private calculateAggregates(groupedTrades: GroupedUpdateTrades): void {
    const newAggregates: TradeAggregates[] = Object.keys(groupedTrades).map((key) => {
      const trades = groupedTrades[key];
      const { sizeSum, openPriceAverage, swapSum, groupProfit } = trades.reduce(
        (acc, trade) => {
          acc.sizeSum += trade.size;
          acc.openPriceAverage += trade.openPrice;
          acc.swapSum += trade.swap;
          acc.groupProfit += trade.profit;
          return acc;
        },
        { sizeSum: 0, openPriceAverage: 0, swapSum: 0, groupProfit: 0 }
      );

      return {
        symbol: key,
        sizeSum,
        openPriceAverage: openPriceAverage / trades.length,
        swapSum,
        groupProfit: groupProfit / trades.length,
        amount: trades.length,
      };
    });

    this._aggregatesData$.next(newAggregates);
  }

  public deleteGroup(symbol: string): void {
    const currentAggregates = this._aggregatesData$.value.filter((group) => group.symbol !== symbol);
    this._aggregatesData$.next(currentAggregates);

    const currentData = this._detailsData$.value;
    const orderIds = currentData[symbol].map((trade) => trade.id);
    delete currentData[symbol];
    this._detailsData$.next(currentData);

    if (orderIds.length == 0) {
      return;
    }

    if (orderIds.length === 1) {
      this.toastService.showToast({ message: `Zamknięto zlecenie nr ${orderIds.join(', ')}`, orderId: orderIds });
      return;
    }

    this.toastService.showToast({ message: `Zamknięto zlecenia nr ${orderIds.join(', ')}`, orderId: orderIds });
    this.webSocketService.unsubscribe([symbol]);
  }

  public deleteTrade(symbol: string, tradeId: number): void {
    const currentData = this._detailsData$.value;
    if (currentData[symbol]) {
      currentData[symbol] = currentData[symbol].filter((trade) => trade.id !== tradeId);
      if (currentData[symbol].length === 0) {
        this.deleteGroup(symbol);
      } else {
        this._detailsData$.next(currentData);
        this.calculateAggregates(currentData);
        this.toastService.showToast({ message: `Zamknięto zlecenie nr ${tradeId}`, orderId: tradeId });
      }
    }
  }

  private calculateProfit(trade: Trade, currentPrice: number): number {
    const multiplier = trade.symbol === TradeSymbol.BTCUSD ? 100 : trade.symbol === TradeSymbol.ETHUSD ? 1000 : 10;
    const sideMultiplier = trade.side === TradeSide.BUY ? 1 : -1;
    return ((currentPrice - trade.openPrice) * multiplier * sideMultiplier) / 100;
  }

  private updatePrices(quotes: { s: string; b: number }[]): void {
    const currentData = this._detailsData$.value;
    quotes.forEach((quote) => {
      const symbol = quote.s;
      const currentPrice = quote.b;
      if (currentData[symbol]) {
        currentData[symbol] = currentData[symbol].map((trade) => ({
          ...trade,
          profit: this.calculateProfit(trade, currentPrice),
        }));
      }
    });
    this._detailsData$.next(currentData);
    this.calculateAggregates(currentData);
  }

  private subscribeToWebSocket(symbols: string[]): void {
    this.webSocketService.subscribe(symbols);
  }

  public expandRow(): void {
    const value = this._isExpand$.value;
    this._isExpand$.next(!value);
  }
}
