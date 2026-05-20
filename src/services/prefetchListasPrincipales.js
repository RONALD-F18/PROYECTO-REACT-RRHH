import { getEmpleados } from './empleados';
import { getContratos } from './contratos';
import { getIncapacidades } from './incapacidades';
import { listarInasistenciasApi } from './api/inasistenciasApi';
import { getAfiliaciones } from './afiliaciones';
import { getCertificaciones } from './certificaciones';
import { listarCalendarioActividadesApi } from './api/calendarioActividadesApi';
import { getBancos } from './bancos';
import { getCargos } from './cargos';

/**
 * Tras el login, calienta caché en memoria y sessionStorage mientras el usuario ve el dashboard.
 */
export function precalentarListasPrincipales() {
  void Promise.allSettled([
    getEmpleados(),
    getContratos(),
    getIncapacidades(),
    listarInasistenciasApi(),
    getAfiliaciones(),
    getCertificaciones(),
    listarCalendarioActividadesApi(),
    getBancos(),
    getCargos(),
  ]);
}
