import { Currency } from '../../common/types/currency.enum';

export interface SymbolData {
  tradeVolume: number;
  symbol: string;
  imbalance: number;
  previousSettlementPrice: number;
  offerPrice: number;
  openInterest: number;
  vwap: number;
  numberOfOrders: number;
  openingPrice: number;
  tickDirection: number;
  securityDesc: string;
  securitySubType: string;
  previousClosingPrice: number;
  settlementType: string;
  quantityOffer: number;
  tradingHighPrice: number;
  denominationCcy: Currency;
  bidPrice: number;
  tradingLowPrice: number;
  market: string;
  volumeAmount: number;
  volume: number;
  trade: number;
  tradeHour: string;
  securityType: string;
  closingPrice: number;
  settlementPrice: number;
  quantityBid: number;
}
