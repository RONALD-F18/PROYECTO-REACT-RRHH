import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos, TarjetasResumen } from '../../componentes';
import {
  codigoCertificacionDesde,
  extraerFilasCertificaciones,
  getCertificaciones,
  getCertificacionById,
  obtenerCatalogosCertificacion,
  normalizarRegistroCertificacion,
} from '../../services/certificaciones';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { CertificationActions, CertificacionesFiltros, ModalCertificacion } from './componentes';
import { extraerMensajeErroresBackend } from './utils/certificacionesPayload';
import { useCreateCertificacion } from './hooks/useCreateCertificacion';
import { useDeleteCertificacion } from './hooks/useDeleteCertificacion';
import { useDownloadCertificacionPdf } from './hooks/useDownloadCertificacionPdf';
import { useUpdateCertificacion } from './hooks/useUpdateCertificacion';
import '../../estilos/modulos/certificaciones.css';

function soloFecha(v) {
  return String(v ?? '').slice(0, 10) || '—';
}

function Certificaciones() {
  const navegar = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const createMut = useCreateCertificacion();
  const updateMut = useUpdateCertificacion();
  const deleteMut = useDeleteCertificacion();
  const pdfMut = useDownloadCertificacionPdf();

  const [catalogos, setCatalogos] = useState({
    empresas: [],
    empleados: [],
    contratos: [],
    afiliaciones: [],
    eps: [],
    arls: [],
    pensiones: [],
    cajas: [],
    cesantias: [],
  });
  const [errorCatalogos, setErrorCatalogos] = useState('');
  const [filtros, setFiltros] = useState({ busqueda: '', tipo: '', desde: '', hasta: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

  const cargarInicial = useCallback(async () => {
    setError('');
    setErrorCatalogos('');
    setLoading(true);
    try {
      const certRaw = await getCertificaciones();
      setData(extraerFilasCertificaciones(certRaw));
    } catch (e) {
      setData([]);
      setError(mensajeErrorApi(e));
    } finally {
      setLoading(false);
    }

    setCargandoCatalogos(true);
    try {
      const cat = await obtenerCatalogosCertificacion({ ligero: true });
      setCatalogos(cat);
    } catch (e) {
      setErrorCatalogos(mensajeErrorApi(e));
    } finally {
      setCargandoCatalogos(false);
    }
  }, []);

  useEffect(() => {
    void cargarInicial();
  }, [cargarInicial]);

  const refetchLista = useCallback(async () => {
    try {
      const certRaw = await getCertificaciones();
      setData(extraerFilasCertificaciones(certRaw));
    } catch (e) {
      setError(mensajeErrorApi(e));
    }
  }, []);

  const filasVista = useMemo(() => {
    const empleadosMap = new Map((catalogos.empleados ?? []).map((e) => [String(e.cod_empleado ?? e.id), e]));
    return (data ?? []).map((row) => {
      const emp = empleadosMap.get(String(row.cod_empleado ?? ''));
      const nombre = emp ? `${emp.nombre_empleado ?? ''} ${emp.apellidos_empleado ?? ''}`.trim() : '—';
      const documento = emp?.doc_iden ?? '—';
      return {
        ...row,
        _empleado: nombre || '—',
        _documento: documento,
      };
    });
  }, [data, catalogos.empleados]);

  const filtradas = useMemo(() => {
    return filasVista.filter((row) => {
      const q = String(filtros.busqueda || '').trim().toLowerCase();
      const tipo = String(filtros.tipo || '').trim().toUpperCase();
      if (q) {
        const blob = [row._empleado, row._documento, row.ciudad_emision, row.cod_certificacion].join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (tipo) {
        const r = String(row.tipo_certificacion || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_');
        if (tipo === 'LABORAL' && !r.includes('LABORAL')) return false;
        if (tipo === 'AFILIACIONES' && !r.includes('AFILIACION')) return false;
      }
      const fecha = soloFecha(row.fecha_emision);
      if (filtros.desde && fecha < filtros.desde) return false;
      if (filtros.hasta && fecha > filtros.hasta) return false;
      return true;
    });
  }, [filasVista, filtros]);

  const tarjetas = useMemo(() => {
    const total = filtradas.length;
    const laborales = filtradas.filter((x) => String(x.tipo_certificacion || '').toUpperCase().includes('LABORAL')).length;
    const afiliaciones = filtradas.filter((x) => String(x.tipo_certificacion || '').toUpperCase() === 'AFILIACIONES').length;
    const hoy = new Date().toISOString().slice(0, 10);
    const ultimos30 = filtradas.filter((x) => {
      const f = new Date(soloFecha(x.fecha_emision));
      const d = new Date(hoy);
      const dias = (d.getTime() - f.getTime()) / 86400000;
      return Number.isFinite(dias) && dias <= 30 && dias >= 0;
    }).length;
    return [
      { etiqueta: 'Total', valor: String(total), color: 'azul', icono: '' },
      { etiqueta: 'Laborales', valor: String(laborales), color: 'verde', icono: '' },
      { etiqueta: 'Afiliaciones', valor: String(afiliaciones), color: 'morado', icono: '' },
      { etiqueta: 'Ultimos 30 dias', valor: String(ultimos30), color: 'amarillo', icono: '' },
    ];
  }, [filtradas]);

  const abrirNuevo = () => {
    setRegistroEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = async (fila) => {
    const id = codigoCertificacionDesde(fila);
    if (id == null) return;
    try {
      const json = await getCertificacionById(id);
      setRegistroEditar(normalizarRegistroCertificacion(json));
      setMostrarModal(true);
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const guardar = async (payload) => {
    try {
      if (registroEditar) {
        await updateMut.mutate(codigoCertificacionDesde(registroEditar), payload);
      } else {
        await createMut.mutate(payload);
      }
      setMostrarModal(false);
      setRegistroEditar(null);
      await refetchLista();
      setMensajeExito('Certificacion guardada correctamente.');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      const msgBackend = extraerMensajeErroresBackend(e);
      if (msgBackend) {
        window.alert(msgBackend || mensajeErrorApi(e));
        return;
      }
      window.alert(mensajeErrorApi(e));
    }
  };

  const eliminar = async (fila) => {
    const id = codigoCertificacionDesde(fila);
    if (id == null) return;
    if (!window.confirm('¿Eliminar certificacion?')) return;
    try {
      await deleteMut.mutate(id);
      await refetchLista();
      setMensajeExito('Certificacion eliminada.');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const manejarPdf = async (fila) => {
    try {
      await pdfMut.download(fila);
    } catch (e) {
      const msg = e?.message && !e.response ? String(e.message) : mensajeErrorApi(e);
      window.alert(msg);
    }
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Certificaciones de Empleados"
        subtitulo="Gestion de certificados laborales y afiliaciones"
        textoBoton="Nueva Certificacion"
        alHacerClic={abrirNuevo}
      />

      <div className="certificaciones-contenido">
        {error || errorCatalogos ? <p className="mensaje-error">{error || errorCatalogos}</p> : null}
        {mensajeExito ? <p className="campo-seccion-exito">{mensajeExito}</p> : null}
        {loading ? <p className="contrato-pagina-cargando">Cargando certificaciones...</p> : null}

        <TarjetasResumen tarjetas={tarjetas} />

        <CertificacionesFiltros
          onAplicar={(f) =>
            setFiltros({
              busqueda: f.busqueda || '',
              tipo: f.tipo || '',
              desde: f.desde || '',
              hasta: f.hasta || '',
            })
          }
        />
        {cargandoCatalogos ? (
          <p className="contrato-pagina-cargando" style={{ marginTop: -4 }}>
            Actualizando datos para formularios…
          </p>
        ) : null}

        <div className="prestaciones-contenedor-principal">
          <h2 className="prestaciones-titulo-seccion">Total de certificaciones generadas</h2>
          <TablaDatos
            accionesAlineacion="center"
            columnas={[
              {
                campo: '_empleado',
                encabezado: 'Empleado',
                renderizar: (nom, fila) => (
                  <div className="usuario-info">
                    <span className="usuario-nombre">{nom}</span>
                    <span className="usuario-documento">Documento: {fila._documento}</span>
                  </div>
                ),
              },
              { campo: 'tipo_certificacion', encabezado: 'Tipo' },
              { campo: 'fecha_emision', encabezado: 'Fecha', renderizar: (v) => soloFecha(v) },
              { campo: 'ciudad_emision', encabezado: 'Ciudad' },
            ]}
            datos={filtradas}
            renderAcciones={(fila) => (
              <CertificationActions
                fila={fila}
                pdfCargando={pdfMut.loading}
                onVer={(r) => navegar(`/certificaciones/${codigoCertificacionDesde(r)}`)}
                onEditar={abrirEditar}
                onEliminar={eliminar}
                onDescargar={manejarPdf}
              />
            )}
          />
        </div>
      </div>

      <ModalCertificacion
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setRegistroEditar(null);
        }}
        catalogos={catalogos}
        registroEditar={registroEditar}
        enviando={createMut.loading || updateMut.loading}
        onGuardar={guardar}
      />
    </ContenedorPrincipal>
  );
}

export default Certificaciones;
