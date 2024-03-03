import { SpreadsheetService } from './spreadsheetService';

async function main() {
  const spreadsheetService = new SpreadsheetService();
  await spreadsheetService.init();

  await spreadsheetService.updatePrices();
}

main();
