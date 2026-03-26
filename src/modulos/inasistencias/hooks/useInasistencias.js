import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEmpleadosApi, extraerEmpleadosApi } from '../../../services/api/empleadosApi';
import {
  listarInasistenciasApi,
  crearInasistenciaApi,
  actualizarInasistenciaApi,
  eliminarInasistenciaApi,
  extraerInasistenciasApi,
} from '../../../services/api/inasistenciasApi';
import { calcularKpisInasistencias, filtrarInasistencias } from '../utils/inasistencias.mapper';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useInasistencias() {
  const [empleados, setEmpleados] = useState([]);
  const [inasistencias, setInasistencias] = useState([]);
  const [filtros, setFiltros] = useState({
    codEmpleado: '',
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    tipo: '',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarTodo = useCallback(async () => {
    setError('');
    setCargando(true);
    try {
      const [empJson, inaJson] = await Promise.all([listarEmpleadosApi(), listarInasistenciasApi()]);
      setEmpleados(extraerEmpleadosApi(empJson));
      setInasistencias(extraerInasistenciasApi(inaJson));
    } catch (e) {
      setError(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const inasistenciasFiltradas = useMemo(
    () => filtrarInasistencias(inasistencias, filtros),
    [inasistencias, filtros],
  );

  const kpis = useMemo(
    () => calcularKpisInasistencias(inasistenciasFiltradas, empleados),
    [inasistenciasFiltradas, empleados],
  );

  const guardarInasistencia = useCallback(
    async ({ id, payload }) => {
      if (id) {
        await actualizarInasistenciaApi(id, payload);
      } else {
        await crearInasistenciaApi(payload);
      }
      await cargarTodo();
    },
    [cargarTodo],
  );

  const borrarInasistencia = useCallback(
    async (id) => {
      await eliminarInasistenciaApi(id);
      await cargarTodo();
    },
    [cargarTodo],
  );

  return {
    empleados,
    inasistencias: inasistenciasFiltradas,
    kpis,
    filtros,
    setFiltros,
    cargando,
    error,
    guardarInasistencia,
    borrarInasistencia,
    recargar: cargarTodo,
  };
}
