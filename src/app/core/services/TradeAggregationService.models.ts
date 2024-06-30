import { Trade } from '@core/http/http.model';

export interface TradeAggregates {
  symbol: string;
  sizeSum: number;
  openPriceAverage: number;
  swapSum: number;
  groupProfit: number;
  amount: number;
}

export interface GroupedTrades {
  [key: string]: Trade[];
}

export interface UpdateTrade extends Trade {
  profit: number;
}

export interface GroupedUpdateTrades {
  [key: string]: UpdateTrade[];
}
