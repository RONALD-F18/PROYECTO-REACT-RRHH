import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, SinDatos } from '../../componentes';
import { ModalIncapacidad } from './componentes';
import {
  getIncapacidades,
  getIncapacidadById,
  getResumenIncapacidades,
  getTiposIncapacidad,
  deleteIncapacidad,
  extraerFilasIncapacidades,
  extraerFilasCatalogo,
  extraerResumenIncapacidades,
  nombreTipoIncapacidadDesdeFila,
  normalizarRegistroIncapacidad,
  parseDetalleIncapacidad,
  codigoIncapacidadDesde,
} from '../../services/incapacidades';
import {
  getEmpleadosCatalogo,
  extraerFilasEmpleados,
  nombreCompletoEmpleado,
  codigoEmpleadoDesde,
} from '../../services/empleados';
import { getContratosCatalogo, extraerFilasContratos } from '../../services/contratos';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ejecutarCargaEnFases } from '../../utils/cargaEnFases';
import { alertaErrorApi, confirmarEliminacion } from '../../utils/alertasSwal';
import { normalizarEstadoIncapacidadApi, opcionesFiltroEstadoIncapacidad } from '../../utils/incapacidadEstado';
import { useCatalogos } from '../../contextos/CatalogosContext';
function diasEntre(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return 0;
  const a = new Date(`${String(fechaInicio).slice(0, 10)}T12:00:00`);
  const b = new Date(`${String(fechaFin).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  return Math.ceil((b - a) / 86400000) + 1;
}

function entidadPagadoraPorTipo(tipo) {
  const t = String(tipo || '');
  if (t.toLowerCase().includes('accidente') || t.toLowerCase().includes('laboral')) return 'ARL';
  if (t.toLowerCase().includes('licencia')) return 'EPS';
  return 'EPS';
}

function formatearPeriodo(fi, ff) {
  const a = fi ? String(fi).slice(0, 10) : '';
  const b = ff ? String(ff).slice(0, 10) : '';
  if (!a || !b) return '—';
  const pa = a.split('-');
  const pb = b.split('-');
  if (pa.length === 3 && pb.length === 3) {
    return `${pa[2]}-${pa[1]}-${pa[0]} al ${pb[2]}-${pb[1]}-${pb[0]}`;
  }
  return `${a} al ${b}`;
}

function formatearCOP(n) {
  if (n == null || n === '') return null;
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}

function Incapacidades() {
  const navegar = useNavigate();
  const { catalogos } = useCatalogos();
  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [resumenApi, setResumenApi] = useState(null);
  const [tiposCatalogo, setTiposCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [incapacidadEditar, setIncapacidadEditar] = useState(null);
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
    estado: '',
    tipo: '',
  });
  const mapaEmpleados = useMemo(() => {
    const m = new Map();
    for (const e of empleados) {
      const c = codigoEmpleadoDesde(e);
      if (c != null) m.set(Number(c), e);
    }
    return m;
  }, [empleados]);

  const filasVista = useMemo(() => {
    return lista.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const codEmp = row.cod_empleado != null ? Number(row.cod_empleado) : null;
      const emp =
        row.empleado && typeof row.empleado === 'object'
          ? row.empleado
          : codEmp != null && Number.isFinite(codEmp)
            ? mapaEmpleados.get(codEmp)
            : null;
      const nombreTipo = nombreTipoIncapacidadDesdeFila(row);
      const fi = row.fecha_inicio ?? row.fechaInicio;
      const ff = row.fecha_fin ?? row.fechaFin;
      const dias = row.dias_incapacidad ?? row.dias ?? diasEntre(fi, ff);
      return {
        ...row,
        _empleado: emp ? nombreCompletoEmpleado(emp) : '—',
        _documento: emp ? String(emp.doc_iden ?? '—') : '—',
        _tipo: nombreTipo,
        _periodo: formatearPeriodo(fi, ff),
        _dias: dias,
        _entidad: row.entidad_responsable ?? row.entidad_pagadora ?? entidadPagadoraPorTipo(nombreTipo),
        _estado: normalizarEstadoIncapacidadApi(row.estado_incapacidad, catalogos),
        _codigoMostrar: codigoIncapacidadDesde(row) ?? '—',
      };
    });
  }, [lista, mapaEmpleados, catalogos]);

  const filasFiltradas = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    const est = criteriosFiltro.estado || '';
    const tipoF = criteriosFiltro.tipo || '';

    return filasVista.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      if (tipoF && String(row._tipo) !== tipoF) return false;
      if (est && row._estado !== est) return false;
      if (q) {
        const nom = String(row._empleado || '').toLowerCase();
        const doc = String(row._documento || '').toLowerCase();
        const cod = String(row._codigoMostrar ?? '');
        if (!nom.includes(q) && !doc.includes(q) && !cod.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filasVista, criteriosFiltro]);

  const kpis = useMemo(() => {
    const r = resumenApi;
    if (!r) {
      return {
        total: 0,
        activas: 0,
        origenComun: 0,
        laboral: 0,
        totalDias: 0,
        costoTotal: '—',
      };
    }
    const ct = r.costo_total;
    return {
      total: Number(r.total) || 0,
      activas: Number(r.activas) || 0,
      origenComun: Number(r.origen_comun) || 0,
      laboral: Number(r.laboral) || 0,
      totalDias: Number(r.total_dias) || 0,
      costoTotal: ct == null || ct === '' ? '—' : formatearCOP(ct),
    };
  }, [resumenApi]);

  const opcionesFiltroEstado = useMemo(
    () => opcionesFiltroEstadoIncapacidad(catalogos),
    [catalogos],
  );

  const opcionesFiltroTipo = useMemo(() => {
    const nCat = tiposCatalogo
      .map((t) => (t?.nombre_tipo != null ? String(t.nombre_tipo).trim() : ''))
      .filter(Boolean);
    if (nCat.length > 0) return [...new Set(nCat)];
    const fromLista = lista.map((row) => nombreTipoIncapacidadDesdeFila(row)).filter((t) => t && t !== '—');
    return [...new Set(fromLista)];
  }, [tiposCatalogo, lista]);

  const recargarLista = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    try {
      const [si, sr] = await Promise.allSettled([
        getIncapacidades(),
        getResumenIncapacidades(),
      ]);
      const partes = [];
      if (si.status === 'fulfilled') setLista(extraerFilasIncapacidades(si.value));
      else {
        setLista([]);
        partes.push(mensajeErrorApi(si.reason));
      }
      if (sr.status === 'fulfilled') setResumenApi(extraerResumenIncapacidades(sr.value));
      else {
        setResumenApi(null);
        partes.push(mensajeErrorApi(sr.reason));
      }
      if (partes.length) setMensajeLista(partes.join(' · '));
    } catch (e) {
      setLista([]);
      setMensajeLista(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    setMensajeLista('');
    setCargando(true);
    void ejecutarCargaEnFases({
      principal: (op) => getIncapacidades(op),
      secundarios: [
        (op) => getEmpleadosCatalogo(op),
        () => getResumenIncapacidades(),
        () => getTiposIncapacidad(),
        (op) => getContratosCatalogo(op),
      ],
      onPrincipal: (json, err) => {
        if (!activo) return;
        if (err) {
          setLista([]);
          setMensajeLista(mensajeErrorApi(err));
        } else {
          setLista(extraerFilasIncapacidades(json));
        }
        setCargando(false);
      },
      onSecundario: (indice, json, err) => {
        if (!activo) return;
        if (indice === 0) setEmpleados(err ? [] : extraerFilasEmpleados(json));
        if (indice === 1) setResumenApi(err ? null : extraerResumenIncapacidades(json));
        if (indice === 2) setTiposCatalogo(err ? [] : extraerFilasCatalogo(json));
        if (indice === 3) setContratos(err ? [] : extraerFilasContratos(json));
      },
    });
    return () => {
      activo = false;
    };
  }, []);

  const manejarNuevaIncapacidad = () => {
    setIncapacidadEditar(null);
    setMostrarModal(true);
  };

  const manejarEditar = async (fila) => {
    const cod = codigoIncapacidadDesde(fila);
    if (cod == null) return;
    try {
      const json = await getIncapacidadById(cod);
      const { incapacidad } = parseDetalleIncapacidad(json);
      const raw = incapacidad ?? normalizarRegistroIncapacidad(json) ?? json?.data;
      setIncapacidadEditar(raw);
      setMostrarModal(true);
    } catch (err) {
      void alertaErrorApi('No se pudo abrir la incapacidad', err);
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = codigoIncapacidadDesde(fila);
    if (cod == null) return;
    const ok = await confirmarEliminacion({ titulo: '¿Eliminar esta incapacidad?' });
    if (!ok) return;
    try {
      await deleteIncapacidad(cod);
      await recargarLista();
      setMensajeExito('Incapacidad eliminada correctamente.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      void alertaErrorApi('No se pudo eliminar la incapacidad', e);
    }
  };

  const alExitoGuardado = async () => {
    await recargarLista();
    setMensajeExito('Cambios guardados correctamente.');
    window.setTimeout(() => setMensajeExito(''), 3000);
    setIncapacidadEditar(null);
  };

  const manejarVer = (fila) => {
    const cod = codigoIncapacidadDesde(fila);
    if (cod != null) navegar(`/incapacidades/${cod}`);
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Módulo Incapacidades"
        subtitulo="Control de incapacidades médicas y licencias"
        textoBoton="Nueva Incapacidad"
        alHacerClic={manejarNuevaIncapacidad}
      />

      <div className="incapacidades-contenido">
        <div>
          <h2 className="incapacidades-titulo">Gestión de Incapacidades</h2>
          <p className="incapacidades-subtitulo">Control de incapacidades médicas y licencias</p>
        </div>

        {mensajeLista ? (
          <div className="login-alerta login-alerta--error" style={{ marginBottom: 16 }} role="alert">
            <p className="login-alerta-mensaje">{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="login-alerta login-alerta--exito" style={{ marginBottom: 16 }} role="status">
            <p className="login-alerta-mensaje">{mensajeExito}</p>
          </div>
        ) : null}
        {cargando ? <p className="contrato-pagina-cargando">Cargando incapacidades…</p> : null}

        <div className="tarjetas-resumen-incapacidades">
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Total</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-morado">{kpis.total}</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Activas</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-rojo">{kpis.activas}</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Origen Común</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-verde">{kpis.origenComun}</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Laboral</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-naranja">{kpis.laboral}</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Total Días</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-morado">{kpis.totalDias}</span>
          </div>
        </div>

        <div className="tarjeta-costo-total">
          <div className="tarjeta-costo-contenido">
            <span className="tarjeta-costo-etiqueta">Costo Total de Incapacidades</span>
            <span className="tarjeta-costo-valor">{kpis.costoTotal}</span>
          </div>
          <div className="tarjeta-costo-icono">$</div>
        </div>

        <FiltrosBusqueda
          placeholderBusqueda="Buscar documento o código..."
          filtrosSelect={[
            {
              nombre: 'estado',
              placeholder: 'Todos los Estados',
              opciones: opcionesFiltroEstado,
            },
            {
              nombre: 'tipo',
              placeholder: 'Todos los Tipos',
              opciones: opcionesFiltroTipo,
            },
          ]}
          onFiltrar={(filtros) => {
            setCriteriosFiltro({
              busqueda: filtros.busqueda || '',
              estado: filtros.estado || '',
              tipo: filtros.tipo || '',
            });
          }}
        />

        <div className="lista-incapacidades">
          {filasFiltradas.length === 0 && !cargando ? (
            <SinDatos mensaje="No se encontraron incapacidades" />
          ) : (
            filasFiltradas.map((incapacidad) => (
              <div key={String(codigoIncapacidadDesde(incapacidad) ?? incapacidad.id)} className="tarjeta-incapacidad">
                <div className="tarjeta-incapacidad-header">
                  <div className="tarjeta-incapacidad-info-empleado">
                    <h3 className="tarjeta-incapacidad-nombre">{incapacidad._empleado}</h3>
                    <p className="tarjeta-incapacidad-documento">Documento: {incapacidad._documento}</p>
                  </div>
                  <div className="tarjeta-incapacidad-acciones">
                    <button
                      type="button"
                      className="btn-accion-incapacidad btn-accion-editar"
                      title="Editar"
                      onClick={() => manejarEditar(incapacidad)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn-accion-incapacidad btn-accion-ver"
                      title="Ver"
                      onClick={() => manejarVer(incapacidad)}
                    >
                      👁
                    </button>
                    <button
                      type="button"
                      className="btn-accion-incapacidad btn-accion-eliminar"
                      title="Eliminar"
                      onClick={() => confirmarEliminar(incapacidad)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="tarjeta-incapacidad-detalles">
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Código</span>
                    <span className="detalle-valor">{incapacidad._codigoMostrar}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Tipo</span>
                    <span className="detalle-valor">{incapacidad._tipo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Periodo</span>
                    <span className="detalle-valor">{incapacidad._periodo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Días</span>
                    <span className="detalle-valor">{incapacidad._dias}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Entidad</span>
                    <span className="detalle-valor">{incapacidad._entidad}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Estado</span>
                    <span
                      className={`etiqueta ${incapacidad._estado === 'Activa' ? 'etiqueta-verde' : 'etiqueta-gris'}`}
                    >
                      {incapacidad._estado}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ModalIncapacidad
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setIncapacidadEditar(null);
        }}
        datosIncapacidad={incapacidadEditar}
        empleados={empleados}
        contratos={contratos}
        alExito={alExitoGuardado}
      />
    </ContenedorPrincipal>
  );
}

export default Incapacidades;
