import axios, { AxiosInstance } from 'axios';
import { SymbolData } from './types/symbolData.interface';
import { BOND_API, CEDEAR_ETF_API, CEDEAR_STOCK_API } from './endpoints';
import { Agent } from 'https';
import { BondResponse } from './types/bondResponse.interface';
import axiosRetry from 'axios-retry';

const DEFAULT_PAYLOAD = {
  excludeZeroPxAndQty: true,
  T2: true,
  T1: false,
  T0: false,
  'Content-Type': 'application/json',
};

export class BymaData {
  private axiosInstace: AxiosInstance;

  constructor() {
    this.axiosInstace = axios.create({
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    });
    axiosRetry(this.axiosInstace, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  async getCedearEtf(): Promise<SymbolData[]> {
    return (await this.axiosInstace.post(CEDEAR_ETF_API, DEFAULT_PAYLOAD)).data;
  }

  async getCedearStocks(): Promise<SymbolData[]> {
    return (await this.axiosInstace.post(CEDEAR_STOCK_API, DEFAULT_PAYLOAD))
      .data;
  }

  async getBonds(): Promise<SymbolData[]> {
    return (
      await this.axiosInstace.post<BondResponse>(BOND_API, DEFAULT_PAYLOAD)
    ).data.data;
  }
}
