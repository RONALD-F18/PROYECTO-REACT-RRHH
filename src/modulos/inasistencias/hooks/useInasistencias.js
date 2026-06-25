import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEmpleadosApi, extraerEmpleadosApi } from '../../../services/api/empleadosApi';
import {
  listarInasistenciasApi,
  listarInasistenciasEmpleadoApi,
  crearInasistenciaApi,
  actualizarInasistenciaApi,
  eliminarInasistenciaApi,
  eliminarTodasInasistenciasEmpleadoApi,
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
  const [inasistenciasEmpleado, setInasistenciasEmpleado] = useState([]);
  const [filtros, setFiltros] = useState({
    codEmpleado: '',
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    tipo: '',
  });
  const [cargando, setCargando] = useState(true);
  const [cargandoEmpleado, setCargandoEmpleado] = useState(false);
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

  const cargarHistorialEmpleado = useCallback(async (codEmpleado, forzar = false) => {
    if (!codEmpleado) {
      setInasistenciasEmpleado([]);
      return;
    }
    setCargandoEmpleado(true);
    try {
      const json = await listarInasistenciasEmpleadoApi(codEmpleado, { forzar });
      setInasistenciasEmpleado(extraerInasistenciasApi(json));
    } catch (e) {
      setInasistenciasEmpleado([]);
      setError(mensajeErrorApi(e));
    } finally {
      setCargandoEmpleado(false);
    }
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  useEffect(() => {
    if (filtros.codEmpleado) {
      void cargarHistorialEmpleado(filtros.codEmpleado);
    } else {
      setInasistenciasEmpleado([]);
    }
  }, [filtros.codEmpleado, cargarHistorialEmpleado]);

  const inasistenciasBase = filtros.codEmpleado ? inasistenciasEmpleado : inasistencias;

  const inasistenciasFiltradas = useMemo(
    () => filtrarInasistencias(inasistenciasBase, filtros),
    [inasistenciasBase, filtros],
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
      if (filtros.codEmpleado) {
        await cargarHistorialEmpleado(filtros.codEmpleado, true);
      }
    },
    [cargarTodo, cargarHistorialEmpleado, filtros.codEmpleado],
  );

  const borrarInasistencia = useCallback(
    async (id) => {
      await eliminarInasistenciaApi(id);
      await cargarTodo(true);
      if (filtros.codEmpleado) {
        await cargarHistorialEmpleado(filtros.codEmpleado, true);
      }
    },
    [cargarTodo, cargarHistorialEmpleado, filtros.codEmpleado],
  );

  const borrarTodasEmpleado = useCallback(
    async (codEmpleado) => {
      await eliminarTodasInasistenciasEmpleadoApi(codEmpleado);
      await cargarTodo(true);
      if (String(filtros.codEmpleado) === String(codEmpleado)) {
        await cargarHistorialEmpleado(codEmpleado, true);
      }
    },
    [cargarTodo, cargarHistorialEmpleado, filtros.codEmpleado],
  );

  return {
    empleados,
    contratos,
    inasistenciasGlobales: inasistencias,
    inasistenciasTodas: inasistenciasBase,
    inasistencias: inasistenciasFiltradas,
    kpis,
    filtros,
    setFiltros,
    cargando: cargando || cargandoEmpleado,
    error,
    guardarInasistencia,
    borrarInasistencia,
    borrarTodasEmpleado,
    recargar: cargarTodo,
  };
}
