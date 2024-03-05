import axios from 'axios';
import { FciDataResponse } from './types/FciData.interface';

export class FciData {
  async getFciPrice(fciData: [string, string]) {
    try {
      const [param1, param2] = fciData;
      const url = this.getUrl(param1, param2);

      const { data } = await axios.get<FciDataResponse>(url);

      return data.data.info.diaria.actual.vcpUnitario;
    } catch (e) {
      console.error('Erorr fetching FCI data: ', JSON.stringify(e));
    }
  }

  getUrl(param1: string, param2: string) {
    return `https://api.cafci.org.ar/fondo/${param1}/clase/${param2}/ficha`;
  }
}
