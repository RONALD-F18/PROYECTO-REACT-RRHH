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
  formatearMonedaCop,
  textoPeriodoPrestacion,
  filaResumenContratoPrestaciones,
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

  const [listaGlobal, setListaGlobal] = useState([]);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [pillEstado, setPillEstado] = useState('Todos');
  const [criteriosGlobal, setCriteriosGlobal] = useState({ busqueda: '' });

  const cargarResumen = useCallback(async () => {
    setErrorResumen('');
    setCargandoResumen(true);
    try {
      const { totales_pendientes, contratos_vigentes } = await getResumenPrestacionesSociales();
      setTotalesPendientes(totales_pendientes ?? {});
      setContratosRaw(contratos_vigentes);
    } catch (e) {
      setTotalesPendientes({});
      setContratosRaw([]);
      setErrorResumen(mensajeErrorApi(e));
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    if (vista !== 'periodos') return;
    let activo = true;
    (async () => {
      setErrorGlobal('');
      setCargandoGlobal(true);
      try {
        const rows = await listarPrestacionesSocialesGlobales();
        if (activo) setListaGlobal(rows);
      } catch (e) {
        if (activo) {
          setListaGlobal([]);
          setErrorGlobal(mensajeErrorApi(e));
        }
      } finally {
        if (activo) setCargandoGlobal(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [vista]);

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
      r = r.filter((f) => String(f._estadoContrato || '').toUpperCase() === esp);
    }
    return r;
  }, [filasContratoBase, criteriosContratos]);

  const filasGlobalFiltradas = useMemo(() => {
    let r = listaGlobal;
    if (pillEstado !== 'Todos') {
      r = r.filter((p) => String(p.estado_pago ?? '').trim() === pillEstado);
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
  }, [listaGlobal, pillEstado, criteriosGlobal]);

  const tarjetasTotalesApi = [
    {
      titulo: 'Prima de servicios (pendiente)',
      valor: formatearMonedaCop(totalesPendientes.total_prima),
      color: 'verde',
    },
    {
      titulo: 'Cesantías (pendiente)',
      valor: formatearMonedaCop(totalesPendientes.total_cesantias),
      color: 'azul',
    },
    {
      titulo: 'Interés cesantías (pendiente)',
      valor: formatearMonedaCop(totalesPendientes.total_intereses),
      color: 'morado',
    },
    {
      titulo: 'Vacaciones (pendiente)',
      valor: formatearMonedaCop(totalesPendientes.total_vacaciones),
      color: 'naranja',
    },
  ];

  const PILL_ESTADOS = ['Todos', 'Pendiente', 'Pagado', 'Trasladado'];

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

        {errorResumen ? (
          <p className="mensaje-error" style={{ marginBottom: 16 }}>
            {errorResumen}
          </p>
        ) : null}

        <div className="tarjetas-prestaciones" style={{ marginBottom: '24px' }}>
          {cargandoResumen
            ? tarjetasTotalesApi.map((_, i) => (
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
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.6)' }} />
                </div>
              ))}
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
                Los filtros se aplican en el navegador; el API no expone parámetros de búsqueda en esta ruta.
              </p>

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
              onFiltrar={(f) => setCriteriosGlobal({ busqueda: f.busqueda ?? '' })}
            />

            {errorGlobal ? (
              <p className="mensaje-error" style={{ marginBottom: 16 }}>
                {errorGlobal}
              </p>
            ) : null}

            <div className="prestaciones-contenedor-principal">
              <h2 className="prestaciones-titulo-seccion">Períodos registrados</h2>
              <p className="prestaciones-meta-tabla">
                {cargandoGlobal
                  ? 'Cargando…'
                  : `Mostrando ${filasGlobalFiltradas.length} de ${listaGlobal.length} períodos`}
              </p>

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
                      Ver contrato
                    </button>
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
    </ContenedorPrincipal>
  );
}

export default PrestacionesSociales;
