import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import {
  KEY_BASE64,
  SERVICE_ACCOUNT_EMAIL,
  SERVICE_ACCOUNT_KEY,
  SHEET_ID,
  SHEET_NAME,
} from './config';
import { InvestmentType, RawRow } from './common/types/rawRow.interface';
import { BymaData } from './bymaSDK/bymaData';
import { SymbolData } from './bymaSDK/types/symbolData.interface';
import { FciData } from './fciSdk/fciData';

export class SpreadsheetService {
  private doc: GoogleSpreadsheet;
  private loadPromise: Promise<void>;
  private bymaData: BymaData;
  private fciData: FciData;

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
    this.fciData = new FciData();
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

  splitTickersAndFci(rows: GoogleSpreadsheetRow<RawRow>[]) {
    return rows.reduce(
      (obj, row) => {
        if (row.get('Tipo') === InvestmentType.FCI) {
          obj.fcis.push(row);
        } else {
          obj.tickersRows.push(row);
          obj.tickers.push(row.get('Ticker'));
        }

        return obj;
      },
      {
        tickersRows: [] as GoogleSpreadsheetRow<RawRow>[],
        tickers: [] as string[],
        fcis: [] as GoogleSpreadsheetRow<RawRow>[],
      },
    );
  }

  async updatePrices() {
    const rows = await this.getRows();
    const { tickers, tickersRows, fcis } = this.splitTickersAndFci(rows);

    await Promise.all([
      this.updateTickers(tickersRows, tickers),
      this.updateFcis(fcis),
    ]);
  }

  private async updateTickers(
    tickersRows: GoogleSpreadsheetRow<RawRow>[],
    tickers: string[],
  ) {
    const symbolData = await this.getPricesForTickers(tickers);

    const promises = tickersRows.map(async (row) => {
      const data = symbolData.find((d) => d.symbol === row.get('Ticker'));

      if (data) {
        row.set('Valor', data.closingPrice);
        await row.save();
      }
    });

    await Promise.allSettled(promises);
  }

  private async updateFcis(fcis: GoogleSpreadsheetRow<RawRow>[]) {
    const promises = fcis.map(async (f) => {
      const metadata = f.get('Metadata').split('-') as [string, string];

      const priceStr = await this.fciData.getFciPrice(metadata);
      const price = Number(priceStr);

      f.set('Valor', price);

      await f.save();
    });

    await Promise.allSettled(promises);
  }
}
