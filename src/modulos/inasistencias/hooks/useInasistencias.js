import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEmpleadosApi, extraerEmpleadosApi } from '../../../services/api/empleadosApi';
import {
  listarInasistenciasApi,
  crearInasistenciaApi,
  actualizarInasistenciaApi,
  eliminarInasistenciaApi,
  extraerInasistenciasApi,
} from '../../../services/api/inasistenciasApi';
import { getContratosCatalogo, extraerFilasContratos } from '../../../services/contratos';
import { calcularKpisInasistencias, filtrarInasistencias } from '../utils/inasistencias.mapper';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { ejecutarCargaEnFases } from '../../../utils/cargaEnFases';

export function useInasistencias() {
  const [empleados, setEmpleados] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [inasistencias, setInasistencias] = useState([]);
  const [filtros, setFiltros] = useState({
    codEmpleado: '',
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    tipo: '',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarTodo = useCallback(async (forzar = false) => {
    setError('');
    setCargando(true);
    const opciones = { forzar };
    await ejecutarCargaEnFases({
      opciones,
      principal: (op) => listarInasistenciasApi(op),
      secundarios: [(op) => listarEmpleadosApi(op), (op) => getContratosCatalogo(op)],
      onPrincipal: (json, err) => {
        if (err) {
          setInasistencias([]);
          setError(mensajeErrorApi(err));
        } else {
          setInasistencias(extraerInasistenciasApi(json));
        }
        setCargando(false);
      },
      onSecundario: (indice, json, err) => {
        if (indice === 0) setEmpleados(err ? [] : extraerEmpleadosApi(json));
        if (indice === 1) setContratos(err ? [] : extraerFilasContratos(json));
      },
    });
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  const inasistenciasFiltradas = useMemo(
    () => filtrarInasistencias(inasistencias, filtros),
    [inasistencias, filtros],
  );

  const kpis = useMemo(() => calcularKpisInasistencias(inasistenciasFiltradas), [inasistenciasFiltradas]);

  const guardarInasistencia = useCallback(
    async ({ id, payload }) => {
      if (id) {
        await actualizarInasistenciaApi(id, payload);
      } else {
        await crearInasistenciaApi(payload);
      }
      await cargarTodo(true);
    },
    [cargarTodo],
  );

  const borrarInasistencia = useCallback(
    async (id) => {
      await eliminarInasistenciaApi(id);
      await cargarTodo(true);
    },
    [cargarTodo],
  );

  return {
    empleados,
    contratos,
    inasistenciasTodas: inasistencias,
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
