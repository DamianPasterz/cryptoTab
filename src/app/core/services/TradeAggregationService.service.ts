import { Injectable, inject } from '@angular/core';
import { Trade, TradeSide, TradeSymbol } from '@core/http/http.model';
import { HttpService } from '@core/http/http.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService } from './toast.service';

export interface TradeAggregates {
  symbol: string;
  sizeSum: number;
  openPriceAverage: number;
  swapSum: number;
  groupProfit: number;
  amount: number;
}

interface GroupedTrades {
  [key: string]: Trade[];
}

export interface UpdateTrade extends Trade {
  profit: number;
}

interface GroupedUpdateTrades {
  [key: string]: UpdateTrade[];
}

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class TradeAggregationService {
  private http = inject(HttpService);
  private toastService = inject(ToastService);

  private _responseData$ = new BehaviorSubject<GroupedTrades>({});
  public responseData$: Observable<GroupedTrades> = this._responseData$.asObservable();

  private _aggregatesData$ = new BehaviorSubject<TradeAggregates[]>([]);
  public aggregatesData$: Observable<TradeAggregates[]> = this._aggregatesData$.asObservable();

  private _detailsData$ = new BehaviorSubject<GroupedUpdateTrades>({});
  public detailsData$: Observable<GroupedUpdateTrades> = this._detailsData$.asObservable();

  public getData(): void {
    this.http
      .getData()
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        const groupedTrades = this.groupTrades(response.data);
        this._responseData$.next(groupedTrades);
        const updatedTrades = this.calculateDetailsData(groupedTrades);
        this._detailsData$.next(updatedTrades);
        this.calculateAggregates(updatedTrades);
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
        const profit = this.calculateProfit(item);
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

    if (orderIds.length === 0) {
      return;
    }
    if (orderIds.length === 1) {
      this.toastService.showToast({ message: `Zamknięto zlecenie nr ${orderIds.join(', ')}`, orderId: orderIds });
      return;
    }

    this.toastService.showToast({ message: `Zamknięto zlecenia nr ${orderIds.join(', ')}`, orderId: orderIds });
  }

  public deleteTrade(symbol: string, tradeId: number): void {
    console.log(tradeId);

    const currentData = this._detailsData$.value;
    if (currentData[symbol]) {
      currentData[symbol] = currentData[symbol].filter((trade) => trade.id !== tradeId);
      if (currentData[symbol].length === 0) {
        this.deleteGroup(symbol);
      } else {
        this._detailsData$.next(currentData);
        this.calculateAggregates(currentData);
      }
    }
    this.toastService.showToast({ message: `Zamknięto zlecenie nr ${tradeId}`, orderId: tradeId });
  }

  private calculateProfit(trade: Trade): number {
    const multiplier = trade.symbol === TradeSymbol.BTCUSD ? 100 : trade.symbol === TradeSymbol.ETHUSD ? 1000 : 10;
    const sideMultiplier = trade.side === TradeSide.BUY ? 1 : -1;
    return ((trade.closePrice - trade.openPrice) * multiplier * sideMultiplier) / 100;
  }
}
