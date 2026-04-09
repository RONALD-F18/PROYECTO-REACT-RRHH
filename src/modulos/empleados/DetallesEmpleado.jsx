import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalEmpleado } from './componentes';
import {
  getEmpleadoById,
  normalizarRegistroEmpleado,
  nombreCompletoEmpleado,
  codigoEmpleadoDesde,
} from '../../services/empleados';
import { getBancos, extraerFilasBancos } from '../../services/bancos';
import { mergeCatalogoPorClave } from '../../utils/mergeCatalogos';
import { BANCOS_COLOMBIA_SUPLEMENTO } from '../../data/catalogosColombiaSuplemento';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import {
  etiquetaTipoDocumento,
  etiquetaTipoCuenta,
  etiquetaEstadoEmp,
  etiquetaDiscapacidad,
  etiquetaEstadoCivil,
  etiquetaGrupoSanguineo,
} from './empleadoEnums';

function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(valor);
}

function inicialesDesdeEmpleado(e) {
  if (!e || typeof e !== 'object') return '?';
  const n = (e.nombre_empleado || '').trim();
  const a = (e.apellidos_empleado || '').trim();
  const i1 = n.charAt(0);
  const i2 = a.charAt(0) || n.charAt(1) || '';
  const s = (i1 + i2).toUpperCase();
  return s || '?';
}

function claseEtiquetaEstadoEmp(valor) {
  const u = String(valor || '').toUpperCase();
  if (u === 'ACTIVO') return 'activo';
  if (u === 'RETIRADO' || u === 'INACTIVO') return 'retirado';
  return 'inactivo';
}

function DetallesEmpleado() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [nombreBanco, setNombreBanco] = useState('—');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [bancosLista, setBancosLista] = useState([]);

  const cargar = useCallback(async () => {
    if (!id) return;
    setError('');
    setCargando(true);
    try {
      const [sEmp, sBan] = await Promise.allSettled([getEmpleadoById(id), getBancos()]);
      if (sEmp.status !== 'fulfilled') {
        setEmpleado(null);
        setBancosLista([]);
        setError(mensajeErrorApi(sEmp.reason));
        return;
      }
      const emp = normalizarRegistroEmpleado(sEmp.value);
      const codEmp = codigoEmpleadoDesde(emp);
      if (!emp || codEmp == null) {
        setEmpleado(null);
        setBancosLista([]);
        setError('No se encontró el empleado.');
        return;
      }
      setEmpleado(
        emp.cod_empleado != null ? emp : { ...emp, cod_empleado: codEmp },
      );

      const rawBan = sBan.status === 'fulfilled' ? sBan.value : null;
      const bancos = mergeCatalogoPorClave(extraerFilasBancos(rawBan), BANCOS_COLOMBIA_SUPLEMENTO, 'cod_banco');
      setBancosLista(bancos);
      const codBanco = emp.cod_banco;
      const b = bancos.find((x) => Number(x.cod_banco) === Number(codBanco));
      setNombreBanco(b?.nombre_banco ?? (codBanco != null ? `Código ${codBanco}` : '—'));
    } catch (e) {
      setEmpleado(null);
      setBancosLista([]);
      setError(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Empleados" subtitulo="Detalle" mostrarBoton={false} />
        <p className="empleado-pagina-cargando">Cargando…</p>
      </ContenedorPrincipal>
    );
  }

  if (error || !empleado) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Empleados" subtitulo="Detalle" mostrarBoton={false} />
        <div className="empleado-pagina-alerta empleado-pagina-alerta--error" role="alert">
          <p>{error || 'No disponible.'}</p>
          <button type="button" className="btn-volver" style={{ marginTop: 12 }} onClick={() => navegar('/empleados')}>
            ← Volver al listado
          </button>
        </div>
      </ContenedorPrincipal>
    );
  }

  const nombreCompleto = nombreCompletoEmpleado(empleado);

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo titulo="Empleados" subtitulo="Información detallada del colaborador" mostrarBoton={false} />

      <div className="detalles-empleado">
        <div className="detalles-acciones">
          <button type="button" className="btn-volver" onClick={() => navegar('/empleados')}>
            ← Volver
          </button>
          <div className="detalles-botones-accion">
            <button type="button" className="btn-accion btn-accion-editar" onClick={() => setMostrarModal(true)} title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="tarjeta-perfil">
          <div className="perfil-avatar">
            <span className="avatar-iniciales">{inicialesDesdeEmpleado(empleado)}</span>
          </div>
          <div className="perfil-info">
            <h2 className="perfil-nombre">{nombreCompleto}</h2>
          </div>
          <div className="perfil-estado">
            <span className={`etiqueta etiqueta-${claseEtiquetaEstadoEmp(empleado.estado_emp)}`}>
              {etiquetaEstadoEmp(empleado.estado_emp)}
            </span>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información personal</h3>
          <div className="campos-grid">
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Tipo de documento</span>
              <span className="campo-valor">{etiquetaTipoDocumento(empleado.tipo_documento)}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Número de documento</span>
              <span className="campo-valor">{empleado.doc_iden ?? '—'}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Fecha de nacimiento</span>
              <span className="campo-valor">{formatearSoloFecha(empleado.fecha_nac)}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Fecha de expedición del documento</span>
              <span className="campo-valor">{formatearSoloFecha(empleado.fec_exp_doc)}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Celular</span>
              <span className="campo-valor">{empleado.numero_telefono ?? '—'}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Nacionalidad</span>
              <span className="campo-valor">{empleado.nacionalidad ?? '—'}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Estado civil</span>
              <span className="campo-valor">{etiquetaEstadoCivil(empleado.estado_civil)}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información bancaria</h3>
          <div className="campos-grid">
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Banco</span>
              <span className="campo-valor">{nombreBanco}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Código banco (cod_banco)</span>
              <span className="campo-valor">{empleado.cod_banco ?? '—'}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Número de cuenta</span>
              <span className="campo-valor">{empleado.numero_cuenta ?? '—'}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Tipo de cuenta</span>
              <span className="campo-valor">{etiquetaTipoCuenta(empleado.tipo_cuenta)}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Salud</h3>
          <div className="campos-grid">
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Grupo sanguíneo</span>
              <span className="campo-valor">{etiquetaGrupoSanguineo(empleado.grupo_sanguineo)}</span>
            </div>
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Discapacidad</span>
              <span className="campo-valor">{etiquetaDiscapacidad(empleado.discapacidad)}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información adicional</h3>
          <div className="campos-grid">
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Profesión</span>
              <span className="campo-valor">{empleado.profesion ?? '—'}</span>
            </div>
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Dirección</span>
              <span className="campo-valor">{empleado.direccion ?? '—'}</span>
            </div>
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Estado en la empresa</span>
              <span className="campo-valor">{etiquetaEstadoEmp(empleado.estado_emp)}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Descripción</h3>
          <div className="campo-descripcion">
            <div className="descripcion-barra" />
            <p className="descripcion-texto">{empleado.descripcion ?? '—'}</p>
          </div>
        </div>
      </div>

      <ModalEmpleado
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        datosEmpleado={empleado}
        bancos={bancosLista}
        alExito={async () => {
          await cargar();
          setMostrarModal(false);
        }}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesEmpleado;
