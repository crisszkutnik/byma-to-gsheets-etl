export enum InvestmentType {
  CEDEAR = 'CEDEAR',
  ACCION = 'Accion',
  BONO = 'Bono',
  FCI = 'FCI',
}

export interface RawRow {
  Ticker: string;
  'Full ticker': string;
  Tipo: InvestmentType;
  Moneda: string;
  Valor: number;
  Metadata: string;
}
