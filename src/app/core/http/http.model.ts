export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeSymbol {
  BTCUSD = 'BTCUSD',
  ETHUSD = 'ETHUSD',
  TTWO_US = 'TTWO.US',
}

export interface Trade {
  openTime: number;
  openPrice: number;
  swap: number;
  closePrice: number;
  id: number;
  symbol: TradeSymbol;
  side: TradeSide;
  size: number;
}

export interface DataResponse {
  data: Trade[];
}
