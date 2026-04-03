import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContenedorPrincipal } from '../../componentes';
import BotonMenu from '../../componentes/comunes/BotonMenu';
import { esAdminSesionLocal } from '../../services/autenticacion';
import { obtenerDatosDashboard } from '../../services/dashboardResumen';
import {
  GraficaBarrasDashboard,
  GraficaDonutContratos,
  GraficaLineaInasistencias,
} from './DashboardGraficas';

function saludoPorHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatearHora() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function Panel() {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [ultimaCarga, setUltimaCarga] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerDatosDashboard();
      setDatos(res);
      setUltimaCarga(new Date());
    } catch {
      setDatos({
        kpis: [],
        barrasResumen: [],
        inasistencias6Meses: [],
        pieContratos: [],
        actividadesRecientes: [],
        errores: ['sistema'],
      });
      setUltimaCarga(new Date());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const esAdmin = esAdminSesionLocal();
  const accesosRapidos = [
    { ruta: '/empleados', texto: 'Empleados', color: 'btn-amarillo' },
    ...(esAdmin ? [{ ruta: '/usuarios', texto: 'Usuarios', color: 'btn-rosa' }] : []),
    { ruta: '/contratos', texto: 'Contratos', color: 'btn-rosa' },
    { ruta: '/incapacidades', texto: 'Incapacidades', color: 'btn-naranja' },
    { ruta: '/prestaciones', texto: 'Prestaciones', color: 'btn-naranja' },
    { ruta: '/afiliaciones', texto: 'Afiliaciones', color: 'btn-verde' },
    { ruta: '/certificaciones', texto: 'Certificaciones', color: 'btn-amarillo' },
    { ruta: '/comunicaciones-disciplinarias', texto: 'Comunicaciones disciplinarias', color: 'btn-rosa' },
    { ruta: '/inasistencias', texto: 'Inasistencias', color: 'btn-verde' },
    { ruta: '/actividades', texto: 'Calendario de actividades', color: 'btn-naranja' },
    { ruta: '/reportes', texto: 'Reportes', color: 'btn-amarillo' },
  ];

  const obtenerFecha = () =>
    new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const textoUltimaCarga =
    ultimaCarga &&
    ultimaCarga.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const kpis = datos?.kpis ?? [];
  const barras = datos?.barrasResumen ?? [];
  const serieIna = (datos?.inasistencias6Meses ?? []).map((d) => ({
    nombre: d.etiqueta,
    total: d.total,
  }));
  const pieContratos = datos?.pieContratos ?? [];
  const actividadesRecientes = datos?.actividadesRecientes ?? [];
  const errores = datos?.errores ?? [];
  const pieTotal = pieContratos.reduce((s, x) => s + (Number(x.value) || 0), 0);

  const sumaKpi = kpis.reduce((s, k) => s + (Number(k.cantidad) || 0), 0);

  return (
    <ContenedorPrincipal>
      <header className="dashboard-encabezado">
        <div className="dashboard-encabezado-izquierda">
          <div className="dashboard-encabezado-logo">
            <span className="dashboard-encabezado-logo-texto">Talent Sphere</span>
          </div>
          <div className="dashboard-encabezado-info">
            <h1>Panel general</h1>
            <p>Resumen de RRHH con datos del sistema</p>
          </div>
        </div>
        <div className="dashboard-encabezado-derecha">
          <span className="dashboard-fecha">{obtenerFecha()}</span>
          <BotonMenu />
        </div>
      </header>

      <div className="dashboard-cuerpo">
        <section className="dashboard-hero dashboard-tarjeta">
          <div className="dashboard-hero-texto">
            <h2 className="dashboard-hero-titulo">
              {saludoPorHora()}{' '}
              <span className="dashboard-hero-sub">— aquí tienes el pulso del sistema</span>
            </h2>
            <p className="dashboard-hero-meta">
              <span className="dashboard-hero-reloj">{formatearHora()}</span>
              {textoUltimaCarga && (
                <>
                  <span className="dashboard-hero-sep">·</span>
                  Datos actualizados: <strong>{textoUltimaCarga}</strong>
                </>
              )}
            </p>
          </div>
          <div
            className="dashboard-hero-chip"
            title="Suma de los seis indicadores inferiores (referencia rápida, no es un total único de registros en base de datos)"
          >
            <span className="dashboard-hero-chip-val">{cargando ? '—' : sumaKpi}</span>
            <span className="dashboard-hero-chip-lbl">Suma de indicadores</span>
          </div>
          <div className="dashboard-hero-acciones">
            <button
              type="button"
              className="dashboard-hero-refresh"
              onClick={() => void cargar()}
              disabled={cargando}
            >
              {cargando ? 'Actualizando…' : 'Actualizar datos'}
            </button>
          </div>
        </section>

        <section className="dashboard-kpi-grid" aria-label="Indicadores clave">
          {cargando &&
            Array.from({ length: 6 }).map((_, i) => (
              <div className="tarjeta-dato dashboard-kpi-cargando" key={`sk-${i}`}>
                <div className="tarjeta-dato-icono amarillo dashboard-kpi-skeleton" />
                <div className="tarjeta-dato-contenido">
                  <span className="tarjeta-dato-numero dashboard-kpi-skeleton-line" />
                  <span className="tarjeta-dato-texto dashboard-kpi-skeleton-line short" />
                </div>
              </div>
            ))}
          {!cargando &&
            kpis.map((tarjeta) => (
              <div className="tarjeta-dato dashboard-kpi-card" key={tarjeta.id}>
                <div className={`tarjeta-dato-icono ${tarjeta.color}`}>
                  <span />
                </div>
                <div className="tarjeta-dato-contenido">
                  <span className="tarjeta-dato-numero">{tarjeta.cantidad}</span>
                  <span className="tarjeta-dato-texto">{tarjeta.etiqueta}</span>
                </div>
              </div>
            ))}
        </section>

        <div className="dashboard-actividades">
          {errores.length > 0 && (
            <div className="dashboard-alerta-parcial" role="status">
              Algunos datos no se pudieron cargar ({errores.join(', ')}). El resto se muestra con lo
              disponible.
            </div>
          )}

          <div className="dashboard-zona-graficas">
            <div className="dashboard-graficas-principal">
              <div className="dashboard-grafica dashboard-tarjeta dashboard-grafica--volumen">
                <h3 className="dashboard-grafica-titulo">Volumen por área</h3>
                <p className="dashboard-grafica-sub">Conteos clave al día de hoy</p>
                <div className="dashboard-grafica-chart">
                  {barras.length > 0 ? (
                    <GraficaBarrasDashboard datos={barras} />
                  ) : (
                    <p className="dashboard-grafica-vacio">Sin datos para graficar.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-graficas-fila-inferior">
                <div className="dashboard-grafica dashboard-tarjeta">
                  <h3 className="dashboard-grafica-titulo">Inasistencias (6 meses)</h3>
                  <p className="dashboard-grafica-sub">Registros por mes · eje Y = cantidad</p>
                  <div className="dashboard-grafica-chart">
                    {serieIna.length > 0 ? (
                      <GraficaLineaInasistencias datos={serieIna} />
                    ) : (
                      <p className="dashboard-grafica-vacio">Sin registros de inasistencias.</p>
                    )}
                  </div>
                </div>

                <div className="dashboard-grafica dashboard-tarjeta dashboard-tarjeta--contratos">
                  <h3 className="dashboard-grafica-titulo">Contratos</h3>
                  <p className="dashboard-grafica-sub">Vigentes frente al resto</p>
                  <div className="dashboard-grafica-chart dashboard-grafica-chart--pie">
                    {pieTotal > 0 ? (
                      <GraficaDonutContratos items={pieContratos} total={pieTotal} />
                    ) : (
                      <p className="dashboard-grafica-vacio">No hay contratos registrados aún.</p>
                    )}
                  </div>
                  <Link to="/contratos" className="dashboard-grafica-enlace-modulo">
                    Ir a contratos →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-tarjeta dashboard-tarjeta--calendario-resumen">
            <div className="dashboard-tarjeta-superior">
              <h3>Calendario de Actividades</h3>
              <Link to="/actividades" className="dashboard-enlace">
                Abrir módulo →
              </Link>
            </div>
            <p className="dashboard-calendario-intro">
              Últimos eventos registrados. Para crear o editar, abre el módulo.
            </p>
            <h4 className="dashboard-calendario-subtitulo dashboard-calendario-subtitulo--unico">
              Actividades recientes
            </h4>
            <div className="dashboard-lista-actividades">
              {!cargando && actividadesRecientes.length === 0 && (
                <p className="dashboard-lista-vacio">No hay actividades recientes.</p>
              )}
              {actividadesRecientes.map((actividad, indice) => (
                <div className="dashboard-actividad" key={`act-${indice}`}>
                  <div className="dashboard-actividad-detalle">
                    <span className="dashboard-actividad-texto">{actividad.texto}</span>
                    <span className={`etiqueta etiqueta-${actividad.tipoEtiqueta}`}>
                      {actividad.etiqueta}
                    </span>
                  </div>
                  <span className="dashboard-actividad-tiempo">{actividad.tiempo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-acciones">
            <div className="dashboard-acciones-cabecera">
              <h3>Accesos rápidos</h3>
              <p className="dashboard-acciones-sub">Saltos directos a los módulos principales</p>
            </div>
            <div className="dashboard-acciones-grid">
              {accesosRapidos.map((acceso) => (
                <Link key={acceso.ruta} to={acceso.ruta} className={`btn-accion-rapida ${acceso.color}`}>
                  {acceso.texto}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ContenedorPrincipal>
  );
}

export default Panel;
