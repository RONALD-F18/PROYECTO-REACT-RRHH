import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TarjetaInformacion } from '../../componentes';
import {
  codigoCertificacionDesde,
  obtenerCatalogosCertificacion,
} from '../../services/certificaciones';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ModalCertificacion } from './componentes';
import { extraerMensajeErroresBackend } from './utils/certificacionesPayload';
import { useCertificacionDetail } from './hooks/useCertificacionDetail';
import { useDeleteCertificacion } from './hooks/useDeleteCertificacion';
import { useUpdateCertificacion } from './hooks/useUpdateCertificacion';
import '../../estilos/modulos/certificaciones.css';

function Item({ etiqueta, valor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#64748b', fontSize: 13 }}>{etiqueta}</span>
      <strong>{valor ?? '—'}</strong>
    </div>
  );
}

function BarraAccionesDetalle({ onVolver, onEditar, onEliminar, puedeEditar, eliminando }) {
  return (
    <div className="detalles-acciones cert-detalle-barra-acciones">
      <button type="button" className="btn-volver" onClick={onVolver}>
        ← Volver
      </button>
      <div className="detalles-botones-accion">
        <button
          type="button"
          className="btn-accion btn-accion-editar"
          onClick={onEditar}
          disabled={!puedeEditar}
          title="Editar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button type="button" className="btn-accion btn-accion-eliminar" onClick={onEliminar} disabled={eliminando} title="Eliminar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DetalleCertificacion() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { data, loading, error, refetch } = useCertificacionDetail(id);
  const updateMut = useUpdateCertificacion();
  const deleteMut = useDeleteCertificacion();

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
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    setErrorCatalogos('');
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
    void cargarCatalogos();
  }, [cargarCatalogos]);

  const abrirEditar = () => {
    if (!data || cargandoCatalogos) return;
    if (errorCatalogos) {
      window.alert('No se pudieron cargar los catálogos del formulario. Recargue la página o vuelva al listado.');
      return;
    }
    setMostrarModal(true);
  };

  const guardar = async (payload) => {
    const cod = codigoCertificacionDesde(data);
    if (cod == null) return;
    try {
      await updateMut.mutate(cod, payload);
      setMostrarModal(false);
      await refetch();
    } catch (e) {
      const msgBackend = extraerMensajeErroresBackend(e);
      if (msgBackend) {
        window.alert(msgBackend || mensajeErrorApi(e));
        return;
      }
      window.alert(mensajeErrorApi(e));
    }
  };

  const eliminar = async () => {
    const cod = codigoCertificacionDesde(data);
    if (cod == null) return;
    if (!window.confirm('¿Eliminar esta certificación? Esta acción no se puede deshacer.')) return;
    try {
      await deleteMut.mutate(cod);
      navegar('/certificaciones');
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const volverListado = () => navegar('/certificaciones');

  if (loading) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Certificaciones" subtitulo="Detalle" mostrarBoton={false} />
        <p className="contrato-pagina-cargando">Cargando detalle…</p>
      </ContenedorPrincipal>
    );
  }

  if (error || !data) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Certificaciones" subtitulo="Detalle" mostrarBoton={false} />
        <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
          <p>{error || 'No se encontró la certificación.'}</p>
          <button type="button" className="btn-volver" style={{ marginTop: 12 }} onClick={volverListado}>
            ← Volver al listado
          </button>
        </div>
      </ContenedorPrincipal>
    );
  }

  const puedeEditar = !cargandoCatalogos && !errorCatalogos && !updateMut.loading;

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Certificaciones"
        subtitulo="Detalle completo de la certificación seleccionada"
        mostrarBoton={false}
      />

      <div className="detalle-certificacion-page">
        <BarraAccionesDetalle
          onVolver={volverListado}
          onEditar={abrirEditar}
          onEliminar={eliminar}
          puedeEditar={puedeEditar}
          eliminando={deleteMut.loading}
        />

        {errorCatalogos ? <p className="mensaje-error">{errorCatalogos}</p> : null}
        {cargandoCatalogos ? <p className="contrato-pagina-cargando">Cargando formularios…</p> : null}

        <TarjetaInformacion titulo={`Certificacion #${data.cod_certificacion ?? ''}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <Item etiqueta="Tipo" valor={data.tipo_certificacion} />
            <Item etiqueta="Empresa" valor={data.id_empresa} />
            <Item etiqueta="Empleado" valor={data.cod_empleado} />
            <Item etiqueta="Contrato" valor={data.cod_contrato ?? 'Sin contrato'} />
            <Item etiqueta="Incluye salario" valor={data.incluye_salario ? 'Si' : 'No'} />
            <Item etiqueta="Salario certificado" valor={data.salario_certificado ?? '—'} />
            <Item etiqueta="Fecha emision" valor={String(data.fecha_emision ?? '').slice(0, 10)} />
            <Item etiqueta="Ciudad emision" valor={data.ciudad_emision} />
            <Item etiqueta="Descripcion" valor={data.descripcion || 'Sin descripcion'} />
          </div>
        </TarjetaInformacion>
      </div>

      <ModalCertificacion
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        catalogos={catalogos}
        registroEditar={data}
        enviando={updateMut.loading}
        onGuardar={guardar}
      />
    </ContenedorPrincipal>
  );
}

export default DetalleCertificacion;
