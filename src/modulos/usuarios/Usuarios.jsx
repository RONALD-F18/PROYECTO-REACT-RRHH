import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, TablaDatos } from '../../componentes';
import { ModalUsuario } from './componentes';
import { getUsuarios, getUsuarioById, deleteUsuario, extraerFilasUsuarios } from '../../services/usuario';
import { getRolesActivos } from '../../services/rol';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';

function esRegistroUsuario(u) {
  return u != null && typeof u === 'object' && !Array.isArray(u);
}

function nombreFila(u) {
  if (!esRegistroUsuario(u)) return '—';
  const v = u.nombre_usuario ?? u.nombre;
  if (v == null || v === '') return '—';
  return String(v);
}

function correoFila(u) {
  if (!esRegistroUsuario(u)) return '—';
  if (typeof u.email_usuario === 'string' && u.email_usuario.trim()) return u.email_usuario.trim();
  if (typeof u.detalle === 'string' && u.detalle.trim()) return u.detalle.trim();
  return '—';
}

function rolFila(u) {
  if (!esRegistroUsuario(u)) return '—';
  let r;
  if (typeof u.rol === 'string') r = u.rol;
  else if (u.rol && typeof u.rol === 'object' && u.rol.nombre_rol != null) r = u.rol.nombre_rol;
  else r = u.roles?.nombre_rol;
  if (r == null || r === '') return '—';
  return String(r);
}

/** true / false / null si el API envía otro tipo (1, "1", "true", etc.) */
function estadoNormalizado(u) {
  const v = u?.estado_usuario;
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0') return false;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === 'activo') return true;
    if (s === 'false' || s === 'inactivo') return false;
  }
  return null;
}

function estadoTexto(u) {
  const n = estadoNormalizado(u);
  if (n === true) return 'Activo';
  if (n === false) return 'Inactivo';
  return '—';
}

function esAdminFila(u) {
  const nombreRol = rolFila(u);
  if (nombreRol === '—') return false;
  return String(nombreRol).toLowerCase().includes('admin');
}

function formatearFechaRegistro(valor) {
  if (!valor) return '—';
  const texto = String(valor).trim();

  // Laravel suele devolver "YYYY-MM-DD HH:mm:ss" sin zona: lo mostramos sin reinterpretar TZ
  const matchLaravel = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (matchLaravel) {
    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = matchLaravel;
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  }

  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? texto : d.toLocaleString();
}

function Usuarios() {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [rolesCatalogo, setRolesCatalogo] = useState([]);
  const [rolesPendientes, setRolesPendientes] = useState(true);
  const [rolesFallo, setRolesFallo] = useState(false);
  const [nombresRolCatalogo, setNombresRolCatalogo] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
    estado: '',
    rol: '',
  });

  const recargarLista = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    try {
      const json = await getUsuarios();
      setListaUsuarios(extraerFilasUsuarios(json));
    } catch (e) {
      setListaUsuarios([]);
      setMensajeLista(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarExitoGuardado = async (tipo = 'actualizado') => {
    await recargarLista();
    setMensajeExito(tipo === 'creado' ? 'Usuario creado correctamente.' : 'Usuario actualizado correctamente.');
    window.setTimeout(() => setMensajeExito(''), 3000);
  };

  const cargarPagina = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    setRolesPendientes(true);
    const [resUsuarios, resRoles] = await Promise.allSettled([getUsuarios(), getRolesActivos()]);
    if (resUsuarios.status === 'fulfilled') {
      const json = resUsuarios.value;
      setListaUsuarios(extraerFilasUsuarios(json));
    } else {
      setListaUsuarios([]);
      setMensajeLista(mensajeErrorApi(resUsuarios.reason));
    }
    if (resRoles.status === 'fulfilled') {
      const lista = Array.isArray(resRoles.value) ? resRoles.value : [];
      setRolesCatalogo(lista);
      setNombresRolCatalogo(
        lista
          .filter((r) => r && typeof r === 'object' && r.nombre_rol != null && String(r.nombre_rol).trim())
          .map((r) => String(r.nombre_rol).trim()),
      );
      setRolesFallo(false);
    } else {
      setRolesCatalogo([]);
      setNombresRolCatalogo([]);
      setRolesFallo(true);
    }
    setCargando(false);
    setRolesPendientes(false);
  }, []);

  useEffect(() => {
    cargarPagina();
  }, [cargarPagina]);

  const listaVisible = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    return listaUsuarios.filter((u) => {
      const nombre = nombreFila(u).toLowerCase();
      const correo = String(correoFila(u)).toLowerCase();
      if (q && !nombre.includes(q) && !correo.includes(q)) return false;
      if (criteriosFiltro.estado === 'Activo' && estadoNormalizado(u) !== true) return false;
      if (criteriosFiltro.estado === 'Inactivo' && estadoNormalizado(u) !== false) return false;
      if (criteriosFiltro.rol && rolFila(u) !== criteriosFiltro.rol) return false;
      return true;
    });
  }, [listaUsuarios, criteriosFiltro]);

  const estadisticas = {
    total: listaUsuarios.filter(esRegistroUsuario).length,
    activos: listaUsuarios.filter((u) => esRegistroUsuario(u) && estadoNormalizado(u) === true).length,
    inactivos: listaUsuarios.filter((u) => esRegistroUsuario(u) && estadoNormalizado(u) === false).length,
    admins: listaUsuarios.filter((u) => esRegistroUsuario(u) && esAdminFila(u)).length,
  };

  const abrirNuevo = () => {
    setUsuarioEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = async (fila) => {
    const cod = fila.cod_usuario;
    if (cod == null) return;

    const correoOk =
      typeof fila.email_usuario === 'string' && fila.email_usuario.trim().length > 0;
    const nombreOk =
      (typeof fila.nombre_usuario === 'string' && fila.nombre_usuario.trim()) ||
      (typeof fila.nombre === 'string' && fila.nombre.trim());
    const rolOk = fila.cod_rol != null && fila.cod_rol !== '';

    if (correoOk && nombreOk && rolOk) {
      setUsuarioEditar(fila);
      setMostrarModal(true);
      return;
    }

    try {
      const json = await getUsuarioById(cod);
      setUsuarioEditar(json.data ?? fila);
      setMostrarModal(true);
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = fila.cod_usuario;
    if (cod == null) return;
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUsuario(cod);
      await recargarLista();
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  return (
    <ContenedorPrincipal>
      <div className="modulo-usuarios">
        <EncabezadoModulo
          titulo="Gestión de Usuarios"
          subtitulo="Administración de acceso y permisos"
          textoBoton="Nuevo Usuario"
          alHacerClic={abrirNuevo}
        />

        {mensajeLista ? (
          <div className="usuario-pagina-alerta usuario-pagina-alerta--error" role="alert">
            <strong>Error al cargar usuarios</strong>
            <p>{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="usuario-pagina-alerta usuario-pagina-alerta--info" role="status">
            <strong>Operación completada</strong>
            <p>{mensajeExito}</p>
          </div>
        ) : null}
        {cargando ? <p className="usuario-pagina-cargando">Cargando usuarios…</p> : null}

        <div className="tarjetas-resumen">
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Total Usuarios</span>
            <span className="tarjeta-resumen-valor">{estadisticas.total}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Activos</span>
            <span className="tarjeta-resumen-valor verde">{estadisticas.activos}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Inactivos</span>
            <span className="tarjeta-resumen-valor gris">{estadisticas.inactivos}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Administradores</span>
            <span className="tarjeta-resumen-valor azul">{estadisticas.admins}</span>
          </div>
        </div>

        <FiltrosBusqueda
          placeholderBusqueda="Buscar por nombre o correo…"
          filtrosSelect={[
            {
              nombre: 'estado',
              etiqueta: 'Estado',
              placeholder: 'Todos los estados',
              opciones: ['Activo', 'Inactivo'],
            },
            {
              nombre: 'rol',
              etiqueta: 'Rol',
              placeholder: 'Todos los roles',
              opciones: nombresRolCatalogo,
            },
          ]}
          onFiltrar={(filtros) =>
            setCriteriosFiltro({
              busqueda: filtros.busqueda || '',
              estado: filtros.estado || '',
              rol: filtros.rol || '',
            })
          }
        />

        <TablaDatos
          columnas={[
            {
              campo: 'cod_usuario',
              encabezado: 'Código',
              renderizar: (v) => (v != null ? String(v) : '—'),
            },
            {
              campo: '_nombre',
              encabezado: 'Nombre',
              renderizar: (_, u) => nombreFila(u),
            },
            {
              campo: '_correo',
              encabezado: 'Correo',
              renderizar: (_, u) => correoFila(u),
            },
            {
              campo: '_rol',
              encabezado: 'Rol',
              renderizar: (_, u) => {
                const rol = rolFila(u);
                let claseRol = 'funcionario';
                if (rol === 'Administrador') claseRol = 'admin';
                else if (rol === 'Visualizador') claseRol = 'visualizador';
                return <span className={`etiqueta etiqueta-${claseRol}`}>{rol}</span>;
              },
            },
            {
              campo: '_estado',
              encabezado: 'Estado',
              renderizar: (_, u) => {
                const estado = estadoTexto(u);
                const activo = estadoNormalizado(u) === true;
                return (
                  <span className={`etiqueta etiqueta-${activo ? 'activo' : 'inactivo'}`}>
                    {estado}
                  </span>
                );
              },
            },
            {
              campo: 'fecha_registro',
              encabezado: 'Registro',
              renderizar: (v) => formatearFechaRegistro(v),
            },
          ]}
          datos={listaVisible}
          renderAcciones={(usuario) => (
            <>
              <button
                type="button"
                className="btn-accion-tabla btn-accion-editar"
                title="Editar"
                onClick={() => abrirEditar(usuario)}
              >
                ✎
              </button>
              <button
                type="button"
                className="btn-accion-tabla btn-accion-eliminar"
                title="Eliminar"
                onClick={() => confirmarEliminar(usuario)}
              >
                🗑
              </button>
            </>
          )}
        />

        <ModalUsuario
          mostrar={mostrarModal}
          cerrar={() => {
            setMostrarModal(false);
            setUsuarioEditar(null);
          }}
          datosUsuario={usuarioEditar}
          alExito={manejarExitoGuardado}
          rolesCatalogo={rolesCatalogo}
          rolesPendientes={rolesPendientes}
          rolesFallo={rolesFallo}
        />
      </div>
    </ContenedorPrincipal>
  );
}

export default Usuarios;
