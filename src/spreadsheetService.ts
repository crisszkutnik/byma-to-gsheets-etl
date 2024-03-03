import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import {
  KEY_BASE64,
  SERVICE_ACCOUNT_EMAIL,
  SERVICE_ACCOUNT_KEY,
  SHEET_ID,
  SHEET_NAME,
} from './config';
import { RawRow } from './common/types/rawRow.interface';
import { BymaData } from './bymaSDK/bymaData';
import { SymbolData } from './bymaSDK/types/symbolData.interface';

export class SpreadsheetService {
  private doc: GoogleSpreadsheet;
  private loadPromise: Promise<void>;
  private bymaData: BymaData;

  constructor() {
    const auth = new JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: KEY_BASE64
        ? Buffer.from(SERVICE_ACCOUNT_KEY, 'base64').toString()
        : SERVICE_ACCOUNT_KEY,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });
    this.doc = new GoogleSpreadsheet(SHEET_ID, auth);
    this.loadPromise = this.doc.loadInfo();
    this.bymaData = new BymaData();
  }

  get sheet(): GoogleSpreadsheetWorksheet {
    return this.doc.sheetsByTitle[SHEET_NAME];
  }

  async init() {
    await this.loadPromise;
    await this.sheet.loadHeaderRow();
    console.log('Started SpreadsheetService');
  }

  async getRows() {
    return this.sheet.getRows<RawRow>();
  }

  getRelevantData(tickers: string[], data: SymbolData[]) {
    return data.reduce((arr, d) => {
      if (tickers.includes(d.symbol)) {
        arr.push(d);
      }

      return arr;
    }, [] as SymbolData[]);
  }

  async getPricesForTickers(tickers: string[]) {
    const [etfPrice, cedearPrice, bondPrice] = await Promise.all([
      this.bymaData.getCedearEtf(),
      this.bymaData.getCedearStocks(),
      this.bymaData.getBonds(),
    ]);

    const symbolData: SymbolData[] = [
      ...this.getRelevantData(tickers, etfPrice),
      ...this.getRelevantData(tickers, cedearPrice),
      ...this.getRelevantData(tickers, bondPrice),
    ];

    return symbolData;
  }

  async updatePrices() {
    const rows = await this.getRows();
    const tickers = rows.map((row) => row.get('Ticker'));

    const symbolData = await this.getPricesForTickers(tickers);

    const promises = rows.map(async (rows) => {
      const data = symbolData.find((d) => d.symbol === rows.get('Ticker'));

      if (data) {
        rows.set('Valor', data.closingPrice);
        await rows.save();
      }
    });

    await Promise.allSettled(promises);
  }
}
