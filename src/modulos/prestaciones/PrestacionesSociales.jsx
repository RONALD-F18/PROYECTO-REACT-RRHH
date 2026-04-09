import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos, FiltrosBusqueda } from '../../componentes';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { nombreCompletoEmpleado } from '../../services/empleados';
import { nombreCargoDesde } from '../../services/cargos';
import { ESTADO_CONTRATO } from '../contratos/contratoEnums';
import {
  getResumenPrestacionesSociales,
  listarPrestacionesSocialesGlobales,
  textoPeriodoPrestacion,
  filaResumenContratoPrestaciones,
  agregarMontosPrestacionesPorEstado,
  construirTarjetaKpiPrestacion,
  esEstadoPrestacionPagado,
  formatearMonedaCop,
} from '../../services/prestacionesSociales';

function PrestacionesSociales() {
  const navegar = useNavigate();
  const [vista, setVista] = useState('contratos');

  const [totalesPendientes, setTotalesPendientes] = useState({});
  const [contratosRaw, setContratosRaw] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState('');

  const [criteriosContratos, setCriteriosContratos] = useState({
    busqueda: '',
    cargo: '',
    estadoContrato: '',
  });

  /** Todos los períodos de prestaciones (para KPI reales y pestaña períodos). */
  const [periodosTodos, setPeriodosTodos] = useState([]);
  const [errorListadoPeriodos, setErrorListadoPeriodos] = useState('');
  const [pillEstado, setPillEstado] = useState('Todos');
  const [criteriosGlobal, setCriteriosGlobal] = useState({ busqueda: '' });

  const cargarResumen = useCallback(async () => {
    setErrorResumen('');
    setCargandoResumen(true);
    try {
      const rResumen = await getResumenPrestacionesSociales();
      const { totales_pendientes, contratos_vigentes } = rResumen;
      setTotalesPendientes(totales_pendientes ?? {});
      setContratosRaw(contratos_vigentes ?? []);
    } catch (e) {
      setTotalesPendientes({});
      setContratosRaw([]);
      setErrorResumen(mensajeErrorApi(e));
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  const cargarPeriodos = useCallback(async () => {
    setErrorListadoPeriodos('');
    try {
      const rows = await listarPrestacionesSocialesGlobales();
      setPeriodosTodos(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setPeriodosTodos([]);
      setErrorListadoPeriodos(mensajeErrorApi(e));
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    void cargarPeriodos();
  }, [cargarPeriodos]);

  const opcionesCargos = useMemo(() => {
    const nombres = new Set();
    for (const c of contratosRaw) {
      const nom = nombreCargoDesde(c?.cargo ?? {});
      if (nom && nom !== '—') nombres.add(nom);
    }
    return [...nombres].sort();
  }, [contratosRaw]);

  const filasContratoBase = useMemo(
    () => contratosRaw.map((c) => filaResumenContratoPrestaciones(c)).filter(Boolean),
    [contratosRaw]
  );

  const contratosFiltrados = useMemo(() => {
    let r = filasContratoBase;
    const q = criteriosContratos.busqueda.trim().toLowerCase();
    if (q) {
      r = r.filter((f) => {
        const texto = [
          f._nombre,
          f._documento,
          f._numeroContrato,
          String(f.cod_contrato ?? ''),
        ]
          .join(' ')
          .toLowerCase();
        return texto.includes(q);
      });
    }
    if (criteriosContratos.cargo) {
      r = r.filter((f) => f._cargo === criteriosContratos.cargo);
    }
    if (criteriosContratos.estadoContrato) {
      const esp = String(criteriosContratos.estadoContrato).toUpperCase();
      r = r.filter((f) => {
        const u = String(f._estadoContrato || '').toUpperCase();
        const norm = u === 'INACTIVO' ? 'FINALIZADO' : u;
        return norm === esp;
      });
    }
    return r;
  }, [filasContratoBase, criteriosContratos]);

  const montosPorEstado = useMemo(
    () => agregarMontosPrestacionesPorEstado(periodosTodos),
    [periodosTodos],
  );

  const tarjetasTotalesApi = useMemo(() => {
    const api = totalesPendientes;
    /** Si el GET de períodos respondió bien, los KPI salen solo de esos registros (lista vacía => ceros). */
    const listadoPeriodosOk = !errorListadoPeriodos;
    const montos = (clave, claveApi) => {
      if (listadoPeriodosOk) {
        const x = montosPorEstado[clave];
        return { pendiente: x.pendiente, pagado: x.pagado };
      }
      const pend = Number(api[claveApi]) || 0;
      return { pendiente: pend, pagado: 0 };
    };

    const mPrima = montos('prima', 'total_prima');
    const mCes = montos('cesantias', 'total_cesantias');
    const mInt = montos('intereses', 'total_intereses');
    const mVac = montos('vacaciones', 'total_vacaciones');
    const totalLiquidar =
      (Number(mPrima.pendiente) || 0) +
      (Number(mCes.pendiente) || 0) +
      (Number(mInt.pendiente) || 0) +
      (Number(mVac.pendiente) || 0);

    return [
      construirTarjetaKpiPrestacion({
        tituloBase: 'Prima de servicios',
        ...mPrima,
        color: 'verde',
      }),
      construirTarjetaKpiPrestacion({
        tituloBase: 'Cesantías',
        ...mCes,
        color: 'azul',
      }),
      construirTarjetaKpiPrestacion({
        tituloBase: 'Interés cesantías',
        ...mInt,
        color: 'morado',
      }),
      construirTarjetaKpiPrestacion({
        tituloBase: 'Vacaciones',
        ...mVac,
        color: 'naranja',
      }),
      {
        titulo: 'Total a liquidar (pendiente)',
        valor: formatearMonedaCop(totalLiquidar),
        color: 'total',
      },
    ];
  }, [montosPorEstado, errorListadoPeriodos, totalesPendientes]);

  /** Contratos incluidos en el resumen de la pestaña «Contratos a liquidar». */
  const codigosContratoLiquidacion = useMemo(() => {
    const s = new Set();
    for (const c of contratosRaw) {
      const n = Number(c?.cod_contrato);
      if (Number.isFinite(n)) s.add(n);
    }
    return s;
  }, [contratosRaw]);

  /** Hay períodos en el historial cuyo contrato no está en `contratos_vigentes` del resumen. */
  const periodosFueraDeLiquidacion = useMemo(() => {
    if (!periodosTodos.length) return false;
    return periodosTodos.some((p) => {
      const cod = p?.contrato?.cod_contrato;
      if (cod == null) return true;
      return !codigosContratoLiquidacion.has(Number(cod));
    });
  }, [periodosTodos, codigosContratoLiquidacion]);

  const filasGlobalFiltradas = useMemo(() => {
    let r = periodosTodos;
    if (pillEstado === 'Pendiente') {
      r = r.filter((p) => !esEstadoPrestacionPagado(p.estado_pago));
    } else if (pillEstado === 'Pagado') {
      r = r.filter((p) => esEstadoPrestacionPagado(p.estado_pago));
    }
    const q = criteriosGlobal.busqueda.trim().toLowerCase();
    if (q) {
      r = r.filter((p) => {
        const ctr = p.contrato ?? {};
        const emp = ctr.empleado ?? {};
        const blob = [
          nombreCompletoEmpleado(emp),
          emp.doc_iden,
          ctr.cod_contrato,
        ]
          .join(' ')
          .toLowerCase();
        return blob.includes(q);
      });
    }
    return r;
  }, [periodosTodos, pillEstado, criteriosGlobal]);

  const PILL_ESTADOS = ['Todos', 'Pendiente', 'Pagado'];

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Prestaciones Sociales"
        subtitulo="Gestión, cálculo y pagos de beneficios laborales"
        mostrarBoton={false}
      />

      <div className="prestaciones-contenido">
        <div className="prestaciones-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'contratos'}
            className={vista === 'contratos' ? 'prestaciones-tab prestaciones-tab--activa' : 'prestaciones-tab'}
            onClick={() => setVista('contratos')}
          >
            Contratos a liquidar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'periodos'}
            className={vista === 'periodos' ? 'prestaciones-tab prestaciones-tab--activa' : 'prestaciones-tab'}
            onClick={() => setVista('periodos')}
          >
            Todos los períodos
          </button>
        </div>

        <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Prestaciones sociales</h2>

        <p className="prestaciones-nota-api" style={{ marginTop: -16, marginBottom: 20, color: 'var(--gris-600)' }}>
          Los montos y fechas que ve aquí son los que calcula el sistema (por años de vigencia y normativa aplicable en
          cada año). Esta pantalla solo los muestra; no los vuelve a calcular en su equipo.
        </p>

        {errorResumen ? (
          <p className="mensaje-error" style={{ marginBottom: 16 }}>
            {errorResumen}
          </p>
        ) : null}
        {errorListadoPeriodos && !errorResumen ? (
          <p className="prestaciones-nota-api" style={{ marginBottom: 16, color: 'var(--gris-600)' }}>
            No se pudo cargar el listado completo de períodos: {errorListadoPeriodos} Las cifras de las tarjetas
            superiores pueden mostrarse igualmente si hay resumen disponible.
          </p>
        ) : null}

        <div className="prestaciones-scroll-row" aria-label="Resumen de montos">
          <div className="tarjetas-prestaciones">
            {cargandoResumen
              ? Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="tarjeta-prestacion azul" style={{ opacity: 0.6 }}>
                    <div className="tarjeta-prestacion-info">
                      <h3>Cargando…</h3>
                      <p className="tarjeta-prestacion-valor">—</p>
                    </div>
                  </div>
                ))
              : tarjetasTotalesApi.map((tarjeta, indice) => (
                  <div key={indice} className={`tarjeta-prestacion ${tarjeta.color}`}>
                    <div className="tarjeta-prestacion-info">
                      <h3>{tarjeta.titulo}</h3>
                      <p className="tarjeta-prestacion-valor">{tarjeta.valor}</p>
                    </div>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background:
                          tarjeta.color === 'total' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
                      }}
                    />
                  </div>
                ))}
          </div>
        </div>

        {vista === 'contratos' ? (
          <>
            <FiltrosBusqueda
              placeholderBusqueda="Buscar por empleado, documento o contrato..."
              filtrosSelect={[
                {
                  nombre: 'cargo',
                  placeholder: 'Todos los cargos',
                  opciones: opcionesCargos,
                },
                {
                  nombre: 'estadoContrato',
                  placeholder: 'Todos los estados',
                  opciones: ESTADO_CONTRATO.map((e) => ({ valor: e.valor, texto: e.etiqueta })),
                },
              ]}
              onFiltrar={(filtros) =>
                setCriteriosContratos({
                  busqueda: filtros.busqueda ?? '',
                  cargo: filtros.cargo ?? '',
                  estadoContrato: filtros.estadoContrato ?? '',
                })
              }
            />

            <div className="prestaciones-contenedor-principal">
              <h2 className="prestaciones-titulo-seccion">Empleados con prestaciones</h2>
              <p className="prestaciones-nota-api" style={{ marginTop: -12, marginBottom: 16 }}>
                Puede filtrar la tabla desde aquí; la búsqueda y los filtros se aplican sobre la lista ya cargada.
              </p>
              {!cargandoResumen && contratosFiltrados.length === 0 && periodosFueraDeLiquidacion ? (
                <p className="prestaciones-nota-api prestaciones-nota-historial" role="note">
                  <strong>Sin contratos en esta lista:</strong> el resumen de liquidación no incluye contratos en este
                  momento, pero en <strong>Todos los períodos</strong> puede ver registros anteriores (por ejemplo
                  pendientes de un contrato que ya no entra en liquidación). Revise el módulo <strong>Contratos</strong>{' '}
                  o consulte al administrador si los datos no coinciden con lo esperado.
                </p>
              ) : null}

              <div className="prestaciones-tabla-scroll">
              <TablaDatos
                columnas={[
                  {
                    campo: '_nombre',
                    encabezado: 'Empleado',
                    renderizar: (nombre, fila) => (
                      <div className="usuario-info">
                        <span className="usuario-nombre">{nombre}</span>
                        <span className="usuario-documento">C.C {fila._documento}</span>
                      </div>
                    ),
                  },
                  {
                    campo: '_numeroContrato',
                    encabezado: 'Contrato',
                    renderizar: (num, fila) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{num}</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{fila._periodoSubtitulo}</span>
                      </div>
                    ),
                  },
                  { campo: '_cargo', encabezado: 'Cargo' },
                  { campo: '_fechaInicio', encabezado: 'Fecha inicio' },
                ]}
                datos={contratosFiltrados}
                renderAcciones={(fila) => (
                  <button
                    type="button"
                    className="btn btn-primario btn-sm"
                    onClick={() => navegar(`/prestaciones/${fila.cod_contrato}`)}
                  >
                    Ver detalles
                  </button>
                )}
              />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="prestaciones-pills" role="group" aria-label="Filtrar por estado de pago">
              {PILL_ESTADOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    pillEstado === p ? 'prestaciones-pill prestaciones-pill--activa' : 'prestaciones-pill'
                  }
                  onClick={() => setPillEstado(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <FiltrosBusqueda
              placeholderBusqueda="Buscar por empleado, documento o contrato..."
              filtrosSelect={[]}
              onFiltrar={(f) => {
                setCriteriosGlobal({ busqueda: f.busqueda ?? '' });
              }}
            />

            <div className="prestaciones-contenedor-principal">
              <h2 className="prestaciones-titulo-seccion">Períodos registrados</h2>
              <p className="prestaciones-meta-tabla">
                {cargandoResumen
                  ? 'Cargando…'
                  : `Mostrando ${filasGlobalFiltradas.length} de ${periodosTodos.length} períodos`}
              </p>
              {periodosFueraDeLiquidacion ? (
                <p className="prestaciones-nota-api prestaciones-nota-historial" role="note">
                  <strong>¿Por qué un período «pendiente» no aparece en Contratos a liquidar?</strong> Esa pestaña muestra
                  solo los contratos que el sistema considera vigentes para liquidar ahora. En esta vista ve el{' '}
                  <strong>historial completo</strong>: si el contrato ya no entra en liquidación (finalizado, retirado,
                  etc.), el período puede seguir apareciendo aquí hasta que se gestione el pago, se archive o se elimine
                  según las reglas del sistema.
                </p>
              ) : null}

              <div className="prestaciones-tabla-scroll">
              <TablaDatos
                columnas={[
                  {
                    campo: 'cod_prestacion_social_periodo',
                    encabezado: 'ID',
                    renderizar: (id) => (id != null ? id : '—'),
                  },
                  {
                    campo: '_emp',
                    encabezado: 'Empleado',
                    renderizar: (_, p) => {
                      const ctr = p.contrato ?? {};
                      const emp = ctr.empleado ?? {};
                      const car = ctr.cargo ?? {};
                      return (
                        <div className="usuario-info">
                          <span className="usuario-nombre">{nombreCompletoEmpleado(emp)}</span>
                          <span className="usuario-documento">{nombreCargoDesde(car)}</span>
                        </div>
                      );
                    },
                  },
                  {
                    campo: '_contrato',
                    encabezado: 'Contrato',
                    renderizar: (_, p) => {
                      const c = p.contrato?.cod_contrato;
                      return c != null ? `N°${c}` : '—';
                    },
                  },
                  {
                    campo: '_periodo',
                    encabezado: 'Período',
                    renderizar: (_, p) =>
                      textoPeriodoPrestacion(p.fecha_periodo_inicio, p.fecha_periodo_fin),
                  },
                  {
                    campo: 'cesantias_valor',
                    encabezado: 'Cesantías',
                    renderizar: (v) => formatearMonedaCop(v),
                  },
                  {
                    campo: 'intereses_cesantias_valor',
                    encabezado: 'Intereses',
                    renderizar: (v) => formatearMonedaCop(v),
                  },
                  {
                    campo: 'prima_valor',
                    encabezado: 'Prima',
                    renderizar: (v) => formatearMonedaCop(v),
                  },
                  {
                    campo: 'vacaciones_valor',
                    encabezado: 'Vacaciones',
                    renderizar: (v) => formatearMonedaCop(v),
                  },
                  {
                    campo: 'estado_pago',
                    encabezado: 'Estado',
                    renderizar: (est) => {
                      const s = String(est ?? '');
                      const cls =
                        s === 'Pagado'
                          ? 'badge-estado badge-pagado'
                          : s === 'Trasladado'
                            ? 'badge-estado badge-trasladado'
                            : 'badge-estado badge-pendiente';
                      return <span className={cls}>{s || '—'}</span>;
                    },
                  },
                ]}
                datos={filasGlobalFiltradas}
                renderAcciones={(p) => {
                  const cod = p.contrato?.cod_contrato;
                  return (
                    <button
                      type="button"
                      className="btn btn-primario btn-sm"
                      disabled={cod == null}
                      onClick={() => {
                        if (cod != null) navegar(`/prestaciones/${cod}`);
                      }}
                    >
                      Ver prestaciones
                    </button>
                  );
                }}
              />
              </div>
            </div>
          </>
        )}
      </div>
    </ContenedorPrincipal>
  );
}

export default PrestacionesSociales;
