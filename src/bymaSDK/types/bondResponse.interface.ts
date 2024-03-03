import { SymbolData } from './symbolData.interface';

export interface BondResponse {
  content: {
    page_number: string;
    page_count: string;
    page_size: string;
    total_elements_count: string;
  };
  data: SymbolData[];
}
