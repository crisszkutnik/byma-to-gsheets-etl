export interface FciDataResponse {
  success: string;
  data: {
    info: {
      diaria: {
        actual: {
          fecha: string;
          patrimonio: string;
          vcpUnitario: string;
          vcp: string;
          patrimonioNetoFondo: string;
        };
      };
    };
  };
}
