import { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import {
  validarNumeroDocumento,
  prevenirSiNoEsDigito,
  prevenirSiNoEsPasaporteDoc,
  prevenirSiNoEsLetrasNombre,
  prevenirSiNoEsNacionalidad,
  prevenirSiNoEsProfesion,
  sanitizarSoloDigitos,
  sanitizarDocPasaporte,
  sanitizarLetrasNombre,
  sanitizarNacionalidad,
  sanitizarProfesion,
} from '../../../utils/validaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import {
  createEmpleado,
  patchEmpleado,
  normalizarRegistroEmpleado,
  codigoEmpleadoDesde,
} from '../../../services/empleados';
import {
  TIPO_DOCUMENTO,
  TIPO_CUENTA,
  ESTADO_EMP,
  DISCAPACIDAD,
  ESTADO_CIVIL,
  GRUPO_SANGUINEO,
} from '../empleadoEnums';

import '../../../estilos/componentes/formulario-secciones.css';

const TELEFONO_CO = /^3[0-9]{9}$/;
const CUENTA_DIGITOS = /^\d{8,20}$/;
const NACIONALIDAD_OK = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/u;

function mismoDia(fechaA, fechaB) {
  if (!fechaA || !fechaB) return false;
  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate()
  );
}

function parseFechaLocal(fechaISO) {
  const t = String(fechaISO ?? '').trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  // Validación robusta: evita fechas inexistentes como 2026-02-31
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function validarFechaNacimientoColombia(valor) {
  const f = parseFechaLocal(valor);
  if (!f) return 'La fecha de nacimiento es inválida.';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  if (mismoDia(f, hoy)) return 'La fecha de nacimiento no puede ser hoy.';
  if (mismoDia(f, manana)) return 'La fecha de nacimiento no puede ser mañana.';
  if (f > hoy) return 'La fecha de nacimiento no puede ser futura.';

  // Rango extremo razonable para evitar inconsistencias (permite aprendices menores).
  const hace120 = new Date(hoy);
  hace120.setFullYear(hace120.getFullYear() - 120);
  if (f < hace120) return 'La fecha de nacimiento excede el rango permitido.';

  return null;
}

function validarDocPorTipo(tipoDocumento, doc) {
  const d = String(doc ?? '').trim();
  if (!d) return 'El documento es obligatorio.';

  if (String(tipoDocumento || '').toUpperCase() === 'PASAPORTE') {
    if (d.length < 3) return 'Ingrese el número de pasaporte.';
    if (d.length > 50) return 'El pasaporte no puede superar 50 caracteres.';
    if (!/^[A-Za-z0-9-]+$/.test(d)) return 'Pasaporte inválido.';
    return null;
  }

  // CC / CE / TI: solo dígitos y longitud (Colombia varía; rango práctico 5-10).
  if (!/^\d+$/.test(d)) return 'El documento debe ser numérico para este tipo.';
  const len = d.length;
  const min = 5;
  const max = 10;
  if (len < min || len > max) return `El documento debe tener entre ${min} y ${max} dígitos para ${tipoDocumento}.`;
  return null;
}

function estadoInicialVacio() {
  return {
    nombre_empleado: '',
    apellidos_empleado: '',
    doc_iden: '',
    tipo_documento: '',
    fecha_nac: '',
    direccion: '',
    numero_telefono: '',
    numero_cuenta: '',
    tipo_cuenta: '',
    cod_banco: '',
    estado_emp: 'ACTIVO',
    discapacidad: 'NINGUNA',
    nacionalidad: '',
    estado_civil: '',
    grupo_sanguineo: '',
    profesion: '',
    fec_exp_doc: '',
    descripcion: '',
  };
}

function empleadoApiAFormulario(emp) {
  const e = normalizarRegistroEmpleado(emp) ?? emp;
  if (!e || typeof e !== 'object') return estadoInicialVacio();
  return {
    nombre_empleado: e.nombre_empleado ?? '',
    apellidos_empleado: e.apellidos_empleado ?? '',
    doc_iden: e.doc_iden != null ? String(e.doc_iden) : '',
    tipo_documento: e.tipo_documento ? String(e.tipo_documento).toUpperCase() : '',
    fecha_nac: e.fecha_nac ? String(e.fecha_nac).slice(0, 10) : '',
    direccion: e.direccion ?? '',
    numero_telefono: e.numero_telefono != null ? String(e.numero_telefono) : '',
    numero_cuenta: e.numero_cuenta != null ? String(e.numero_cuenta) : '',
    tipo_cuenta: e.tipo_cuenta ? String(e.tipo_cuenta).toUpperCase() : '',
    cod_banco: e.cod_banco != null && e.cod_banco !== '' ? String(e.cod_banco) : '',
    estado_emp: e.estado_emp ? String(e.estado_emp).toUpperCase() : 'ACTIVO',
    discapacidad: e.discapacidad ? String(e.discapacidad).toUpperCase() : 'NINGUNA',
    nacionalidad: e.nacionalidad ?? '',
    estado_civil: e.estado_civil ? String(e.estado_civil).toUpperCase() : '',
    grupo_sanguineo: e.grupo_sanguineo ? String(e.grupo_sanguineo).toUpperCase() : '',
    profesion: e.profesion ?? '',
    fec_exp_doc: e.fec_exp_doc ? String(e.fec_exp_doc).slice(0, 10) : '',
    descripcion: e.descripcion ?? '',
  };
}

function valoresPayloadEquivalentes(a, b) {
  if (a === b) return true;
  const vacio = (v) => v === null || v === undefined || v === '';
  if (vacio(a) && vacio(b)) return true;
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a);
    const nb = Number(b);
    return !Number.isNaN(na) && !Number.isNaN(nb) && na === nb;
  }
  return String(a).trim() === String(b).trim();
}

/** Solo claves distintas al guardado inicial (evita rules unique en PUT completo sin ignore en Laravel). */
function construirPayloadParcialEdicion(payloadActual, payloadInicial) {
  if (payloadInicial == null || typeof payloadInicial !== 'object') return payloadActual;
  const diff = {};
  const claves = new Set([...Object.keys(payloadActual), ...Object.keys(payloadInicial)]);
  for (const k of claves) {
    if (!valoresPayloadEquivalentes(payloadActual[k], payloadInicial[k])) {
      diff[k] = payloadActual[k];
    }
  }
  return diff;
}

function construirPayload(formulario) {
  const codBanco = formulario.cod_banco === '' ? null : parseInt(formulario.cod_banco, 10);
  return {
    nombre_empleado: formulario.nombre_empleado.trim(),
    apellidos_empleado: formulario.apellidos_empleado.trim(),
    doc_iden: formulario.doc_iden.trim(),
    tipo_documento: formulario.tipo_documento,
    fecha_nac: formulario.fecha_nac,
    direccion: formulario.direccion.trim(),
    numero_telefono: formulario.numero_telefono.trim(),
    numero_cuenta: formulario.numero_cuenta.trim(),
    tipo_cuenta: formulario.tipo_cuenta,
    cod_banco: codBanco,
    estado_emp: formulario.estado_emp,
    discapacidad: formulario.discapacidad,
    nacionalidad: formulario.nacionalidad.trim(),
    estado_civil: formulario.estado_civil,
    grupo_sanguineo: formulario.grupo_sanguineo,
    profesion: formulario.profesion.trim(),
    fec_exp_doc: formulario.fec_exp_doc,
    descripcion: formulario.descripcion.trim(),
  };
}

/** Validación de un solo campo (también se usa en onKeyUp). */
function validarCampoEmpleado(campo, f) {
  switch (campo) {
    case 'nombre_empleado':
      if (!f.nombre_empleado.trim()) return 'El nombre es obligatorio.';
      return null;
    case 'apellidos_empleado':
      if (!f.apellidos_empleado.trim()) return 'Los apellidos son obligatorios.';
      return null;
    case 'doc_iden':
      if (!f.doc_iden.trim()) return 'El documento es obligatorio.';
      if (!f.tipo_documento) return 'Seleccione el tipo de documento.';
      return validarDocPorTipo(f.tipo_documento, f.doc_iden.trim());
    case 'tipo_documento':
      return f.tipo_documento ? null : 'Seleccione el tipo de documento.';
    case 'fecha_nac':
      if (!f.fecha_nac) return 'La fecha de nacimiento es obligatoria.';
      return validarFechaNacimientoColombia(f.fecha_nac);
    case 'direccion':
      return f.direccion.trim() ? null : 'La dirección es obligatoria.';
    case 'numero_telefono':
      if (!f.numero_telefono.trim()) return 'El celular es obligatorio.';
      if (!TELEFONO_CO.test(f.numero_telefono.trim())) {
        return 'Use 10 dígitos: inicia en 3 (ej. 3001234567).';
      }
      return null;
    case 'numero_cuenta':
      if (!f.numero_cuenta.trim()) return 'El número de cuenta es obligatorio.';
      if (!CUENTA_DIGITOS.test(f.numero_cuenta.trim())) {
        return 'Solo dígitos, entre 8 y 20.';
      }
      return null;
    case 'tipo_cuenta':
      return f.tipo_cuenta ? null : 'Seleccione el tipo de cuenta.';
    case 'cod_banco':
      if (!f.cod_banco) return 'Seleccione un banco.';
      if (Number.isNaN(parseInt(f.cod_banco, 10))) return 'Banco no válido.';
      return null;
    case 'discapacidad':
      return f.discapacidad ? null : 'Seleccione una opción.';
    case 'nacionalidad':
      if (!f.nacionalidad.trim()) return 'La nacionalidad es obligatoria.';
      if (!NACIONALIDAD_OK.test(f.nacionalidad.trim())) return 'Solo letras y espacios.';
      return null;
    case 'estado_civil':
      return f.estado_civil ? null : 'Seleccione el estado civil.';
    case 'grupo_sanguineo':
      return f.grupo_sanguineo ? null : 'Seleccione el grupo sanguíneo.';
    case 'profesion':
      if (!f.profesion.trim()) return 'La profesión es obligatoria.';
      if (f.profesion.trim().length > 100) return 'Máximo 100 caracteres.';
      return null;
    case 'fec_exp_doc': {
      if (!f.fec_exp_doc) return 'La fecha de expedición del documento es obligatoria.';
      const n = f.fecha_nac ? new Date(`${f.fecha_nac}T12:00:00`) : null;
      const x = new Date(`${f.fec_exp_doc}T12:00:00`);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (n && x <= n) return 'Debe ser posterior a la fecha de nacimiento.';
      if (x > hoy) return 'No puede ser posterior a hoy.';
      return null;
    }
    case 'descripcion':
      if (!f.descripcion.trim()) return 'La descripción es obligatoria.';
      if (f.descripcion.trim().length > 500) return 'Máximo 500 caracteres.';
      return null;
    default:
      return null;
  }
}

const CAMPOS_VALIDAR_ENVIO = [
  'nombre_empleado',
  'apellidos_empleado',
  'doc_iden',
  'tipo_documento',
  'fecha_nac',
  'direccion',
  'numero_telefono',
  'numero_cuenta',
  'tipo_cuenta',
  'cod_banco',
  'discapacidad',
  'nacionalidad',
  'estado_civil',
  'grupo_sanguineo',
  'profesion',
  'fec_exp_doc',
  'descripcion',
];

function validar(formulario) {
  const err = {};
  for (const c of CAMPOS_VALIDAR_ENVIO) {
    const m = validarCampoEmpleado(c, formulario);
    if (m) err[c] = m;
  }
  return err;
}

const CAMPOS_POR_PASO_EMPLEADO = [
  [
    'doc_iden',
    'tipo_documento',
    'nombre_empleado',
    'apellidos_empleado',
    'fecha_nac',
    'fec_exp_doc',
    'numero_telefono',
    'direccion',
    'nacionalidad',
    'estado_civil',
  ],
  ['cod_banco', 'numero_cuenta', 'tipo_cuenta', 'profesion'],
  ['grupo_sanguineo', 'discapacidad', 'descripcion'],
];

function campoTieneErrorApi(campo, erroresApi) {
  const x = erroresApi?.[campo];
  if (x == null) return false;
  if (Array.isArray(x)) return x.some((m) => m != null && String(m).trim() !== '');
  if (typeof x === 'string') return x.trim().length > 0;
  return true;
}

function primerPasoConErroresEmpleado(erroresCliente, erroresApi) {
  const tiene = (c) => Boolean(erroresCliente?.[c]) || campoTieneErrorApi(c, erroresApi);
  for (let i = 0; i < CAMPOS_POR_PASO_EMPLEADO.length; i++) {
    if (CAMPOS_POR_PASO_EMPLEADO[i].some(tiene)) return i;
  }
  const keys = new Set([...Object.keys(erroresCliente || {}), ...Object.keys(erroresApi || {})]);
  for (const k of keys) {
    if (tiene(k)) return 0;
  }
  return 0;
}

function ModalEmpleado({ mostrar, cerrar, datosEmpleado = null, bancos = [], alExito }) {
  const registroEdicion = datosEmpleado ? normalizarRegistroEmpleado(datosEmpleado) : null;
  const codEdicion = codigoEmpleadoDesde(registroEdicion);
  const esEdicion = codEdicion != null;
  const [formulario, setFormulario] = useState(() => estadoInicialVacio());
  const [errores, setErrores] = useState({});
  const [erroresApi, setErroresApi] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [pasoActual, setPasoActual] = useState(0);
  const formRef = useRef(formulario);
  formRef.current = formulario;
  /** Payload al abrir el modal en edición (para PATCH solo con cambios). */
  const payloadInicialEdicionRef = useRef(null);

  const aplicarErroresTrasCambio = (nombreCampo, estadoFusionado) => {
    setErrores((er) => {
      const nuevos = { ...er };
      const m = validarCampoEmpleado(nombreCampo, estadoFusionado);
      if (m) nuevos[nombreCampo] = m;
      else delete nuevos[nombreCampo];
      if (nombreCampo === 'tipo_documento') {
        const md = validarCampoEmpleado('doc_iden', estadoFusionado);
        if (md) nuevos.doc_iden = md;
        else delete nuevos.doc_iden;
      }
      if (nombreCampo === 'fecha_nac' || nombreCampo === 'fec_exp_doc') {
        const mf = validarCampoEmpleado('fec_exp_doc', estadoFusionado);
        if (mf) nuevos.fec_exp_doc = mf;
        else delete nuevos.fec_exp_doc;
      }
      return nuevos;
    });
  };

  const reiniciar = useCallback(() => {
    const reg = datosEmpleado ? normalizarRegistroEmpleado(datosEmpleado) : null;
    if (reg && codigoEmpleadoDesde(reg) != null) {
      const f = empleadoApiAFormulario(reg);
      setFormulario(f);
      payloadInicialEdicionRef.current = construirPayload(f);
    } else {
      setFormulario(estadoInicialVacio());
      payloadInicialEdicionRef.current = null;
    }
    setErrores({});
    setErroresApi({});
    setErrorGeneral('');
    setPasoActual(0);
  }, [datosEmpleado]);

  useEffect(() => {
    if (mostrar) reiniciar();
  }, [mostrar, reiniciar]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (erroresApi[name]) setErroresApi((p) => ({ ...p, [name]: undefined }));

    setFormulario((prev) => {
      let next;
      if (name === 'tipo_documento') {
        const doc =
          value === 'PASAPORTE'
            ? sanitizarDocPasaporte(prev.doc_iden, 50)
            : sanitizarSoloDigitos(prev.doc_iden, 50);
        next = { ...prev, tipo_documento: value, doc_iden: doc };
      } else {
        next = { ...prev };
        switch (name) {
          case 'doc_iden':
            next.doc_iden =
              prev.tipo_documento === 'PASAPORTE'
                ? sanitizarDocPasaporte(value, 50)
                : sanitizarSoloDigitos(value, 50);
            break;
          case 'numero_telefono':
            next.numero_telefono = sanitizarSoloDigitos(value, 10);
            break;
          case 'numero_cuenta':
            next.numero_cuenta = sanitizarSoloDigitos(value, 20);
            break;
          case 'nacionalidad':
            next.nacionalidad = sanitizarNacionalidad(value, 50);
            break;
          case 'nombre_empleado':
            next.nombre_empleado = sanitizarLetrasNombre(value, 100);
            break;
          case 'apellidos_empleado':
            next.apellidos_empleado = sanitizarLetrasNombre(value, 100);
            break;
          case 'profesion':
            next.profesion = sanitizarProfesion(value, 100);
            break;
          case 'direccion':
            next.direccion = String(value).slice(0, 200);
            break;
          case 'descripcion':
            next.descripcion = String(value).slice(0, 500);
            break;
          default:
            next[name] = value;
        }
      }
      queueMicrotask(() => aplicarErroresTrasCambio(name, next));
      return next;
    });
  };

  /** Validación en vivo tras cada tecla (y coherencia fechas / tipo doc). */
  const manejarKeyUpValidar = (e) => {
    const nombre = e.currentTarget.name;
    if (!nombre) return;
    const valorDom = e.currentTarget.value;
    const fusionado = { ...formRef.current, [nombre]: valorDom };
    aplicarErroresTrasCambio(nombre, fusionado);
  };

  const manejarKeyDownDocIden = (e) => {
    if (formulario.tipo_documento === 'PASAPORTE') prevenirSiNoEsPasaporteDoc(e);
    else prevenirSiNoEsDigito(e);
  };

  const mensajeCampo = (campo) => errores[campo] || (erroresApi[campo] && erroresApi[campo][0]);

  const validarAntesDeSiguiente = (idx) => {
    const camposPorPaso = [
      [
        'doc_iden',
        'tipo_documento',
        'nombre_empleado',
        'apellidos_empleado',
        'fecha_nac',
        'fec_exp_doc',
        'numero_telefono',
        'direccion',
        'nacionalidad',
        'estado_civil',
      ],
      ['cod_banco', 'numero_cuenta', 'tipo_cuenta', 'profesion'],
      ['grupo_sanguineo', 'discapacidad', 'descripcion'],
    ];

    const campos = camposPorPaso[idx] ?? [];
    const nuevosErrores = {};
    for (const c of campos) {
      const m = validarCampoEmpleado(c, formulario);
      if (m) nuevosErrores[c] = m;
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setErroresApi({});
    const v = validar(formulario);
    setErrores(v);
    if (Object.keys(v).length > 0) {
      setPasoActual(primerPasoConErroresEmpleado(v, {}));
      return;
    }

    setEnviando(true);
    try {
      const payload = construirPayload(formulario);
      if (esEdicion && codEdicion != null) {
        const parcial = construirPayloadParcialEdicion(payload, payloadInicialEdicionRef.current);
        if (Object.keys(parcial).length === 0) {
          setErrorGeneral('No hay cambios que guardar.');
          return;
        }
        await patchEmpleado(codEdicion, parcial);
        await alExito?.('actualizado');
      } else {
        await createEmpleado(payload);
        await alExito?.('creado');
      }
      cerrar();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 422 && data?.errors && typeof data.errors === 'object') {
        setErroresApi(data.errors);
        setErrorGeneral('Revisa los campos marcados.');
        setPasoActual(primerPasoConErroresEmpleado({}, data.errors));
      } else {
        setErrorGeneral(mensajeErrorApi(err));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo={esEdicion ? 'Editar empleado' : 'Registrar empleado'}
      classNameContenedor="modal-contenido--empleado-form"
    >
      <form className="formulario-empleado-api" onSubmit={manejarGuardar}>
        {errorGeneral ? (
          <div className="empleado-modal-alerta empleado-modal-alerta--error" role="alert">
            <strong>Error</strong>
            <p>{errorGeneral}</p>
          </div>
        ) : null}

        <FormularioPasos
          pasos={[
            { numero: 1, titulo: 'Identificación del Empleado', color: 'morado' },
            { numero: 2, titulo: 'Bancario y laboral', color: 'azul' },
            { numero: 3, titulo: 'Salud y descripción', color: 'verde' },
          ]}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          onCancelar={cerrar}
          enviando={enviando}
          textoGuardar={esEdicion ? 'Actualizar' : 'Guardar'}
          validarAntesDeSiguiente={validarAntesDeSiguiente}
        >
          <div className="formulario-grid-doble formulario-empleado-grid">
          <div className="columna-izquierda" style={{ display: pasoActual === 0 ? 'flex' : 'none' }}>
            {pasoActual === 0 ? (
              <>
            <div className="campo-formulario">
              <label htmlFor="emp-doc_iden">Número de documento *</label>
              <input
                id="emp-doc_iden"
                name="doc_iden"
                value={formulario.doc_iden}
                onChange={manejarCambio}
                onKeyDown={manejarKeyDownDocIden}
                onKeyUp={manejarKeyUpValidar}
                maxLength={50}
                autoComplete="off"
                inputMode={formulario.tipo_documento === 'PASAPORTE' ? 'text' : 'numeric'}
                className={mensajeCampo('doc_iden') ? 'campo-error' : ''}
              />
              {mensajeCampo('doc_iden') ? (
                <span className="mensaje-error">{mensajeCampo('doc_iden')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-tipo_documento">Tipo de documento *</label>
              <select
                id="emp-tipo_documento"
                name="tipo_documento"
                value={formulario.tipo_documento}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('tipo_documento') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {TIPO_DOCUMENTO.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('tipo_documento') ? (
                <span className="mensaje-error">{mensajeCampo('tipo_documento')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-nombre_empleado">Nombre *</label>
              <input
                id="emp-nombre_empleado"
                name="nombre_empleado"
                value={formulario.nombre_empleado}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsLetrasNombre}
                onKeyUp={manejarKeyUpValidar}
                maxLength={100}
                className={mensajeCampo('nombre_empleado') ? 'campo-error' : ''}
              />
              {mensajeCampo('nombre_empleado') ? (
                <span className="mensaje-error">{mensajeCampo('nombre_empleado')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-apellidos_empleado">Apellidos *</label>
              <input
                id="emp-apellidos_empleado"
                name="apellidos_empleado"
                value={formulario.apellidos_empleado}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsLetrasNombre}
                onKeyUp={manejarKeyUpValidar}
                maxLength={100}
                className={mensajeCampo('apellidos_empleado') ? 'campo-error' : ''}
              />
              {mensajeCampo('apellidos_empleado') ? (
                <span className="mensaje-error">{mensajeCampo('apellidos_empleado')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-fecha_nac">Fecha de nacimiento *</label>
              <input
                id="emp-fecha_nac"
                type="date"
                name="fecha_nac"
                value={formulario.fecha_nac}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('fecha_nac') ? 'campo-error' : ''}
              />
              {mensajeCampo('fecha_nac') ? (
                <span className="mensaje-error">{mensajeCampo('fecha_nac')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-fec_exp_doc">Fecha expedición documento *</label>
              <input
                id="emp-fec_exp_doc"
                type="date"
                name="fec_exp_doc"
                value={formulario.fec_exp_doc}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('fec_exp_doc') ? 'campo-error' : ''}
              />
              {mensajeCampo('fec_exp_doc') ? (
                <span className="mensaje-error">{mensajeCampo('fec_exp_doc')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-numero_telefono">Celular (10 dígitos, inicia en 3) *</label>
              <input
                id="emp-numero_telefono"
                name="numero_telefono"
                value={formulario.numero_telefono}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsDigito}
                onKeyUp={manejarKeyUpValidar}
                maxLength={10}
                placeholder="3001234567"
                inputMode="numeric"
                autoComplete="tel"
                className={mensajeCampo('numero_telefono') ? 'campo-error' : ''}
              />
              {mensajeCampo('numero_telefono') ? (
                <span className="mensaje-error">{mensajeCampo('numero_telefono')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-direccion">Dirección *</label>
              <input
                id="emp-direccion"
                name="direccion"
                value={formulario.direccion}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                maxLength={200}
                className={mensajeCampo('direccion') ? 'campo-error' : ''}
              />
              {mensajeCampo('direccion') ? (
                <span className="mensaje-error">{mensajeCampo('direccion')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-nacionalidad">Nacionalidad *</label>
              <input
                id="emp-nacionalidad"
                name="nacionalidad"
                value={formulario.nacionalidad}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsNacionalidad}
                onKeyUp={manejarKeyUpValidar}
                maxLength={50}
                className={mensajeCampo('nacionalidad') ? 'campo-error' : ''}
              />
              {mensajeCampo('nacionalidad') ? (
                <span className="mensaje-error">{mensajeCampo('nacionalidad')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-estado_civil">Estado civil *</label>
              <select
                id="emp-estado_civil"
                name="estado_civil"
                value={formulario.estado_civil}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('estado_civil') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {ESTADO_CIVIL.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('estado_civil') ? (
                <span className="mensaje-error">{mensajeCampo('estado_civil')}</span>
              ) : null}
            </div>
              </>
            ) : null}
          </div>

          <div className="columna-derecha" style={{ display: pasoActual !== 0 ? 'flex' : 'none' }}>
            {pasoActual === 1 ? (
              <>
            <div className="campo-formulario">
              <label htmlFor="emp-cod_banco">Banco *</label>
              <select
                id="emp-cod_banco"
                name="cod_banco"
                value={formulario.cod_banco}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('cod_banco') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {bancos.map((b) => (
                  <option key={b.cod_banco} value={String(b.cod_banco)}>
                    {b.nombre_banco ?? `Banco ${b.cod_banco}`}
                  </option>
                ))}
              </select>
              {mensajeCampo('cod_banco') ? (
                <span className="mensaje-error">{mensajeCampo('cod_banco')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-numero_cuenta">Número de cuenta *</label>
              <input
                id="emp-numero_cuenta"
                name="numero_cuenta"
                value={formulario.numero_cuenta}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsDigito}
                onKeyUp={manejarKeyUpValidar}
                maxLength={20}
                inputMode="numeric"
                autoComplete="off"
                className={mensajeCampo('numero_cuenta') ? 'campo-error' : ''}
              />
              {mensajeCampo('numero_cuenta') ? (
                <span className="mensaje-error">{mensajeCampo('numero_cuenta')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-tipo_cuenta">Tipo de cuenta *</label>
              <select
                id="emp-tipo_cuenta"
                name="tipo_cuenta"
                value={formulario.tipo_cuenta}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('tipo_cuenta') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {TIPO_CUENTA.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('tipo_cuenta') ? (
                <span className="mensaje-error">{mensajeCampo('tipo_cuenta')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-estado_emp">Estado en la empresa *</label>
              <select
                id="emp-estado_emp"
                name="estado_emp"
                value={formulario.estado_emp}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
              >
                {ESTADO_EMP.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-profesion">Profesión *</label>
              <input
                id="emp-profesion"
                name="profesion"
                value={formulario.profesion}
                onChange={manejarCambio}
                onKeyDown={prevenirSiNoEsProfesion}
                onKeyUp={manejarKeyUpValidar}
                maxLength={100}
                className={mensajeCampo('profesion') ? 'campo-error' : ''}
              />
              {mensajeCampo('profesion') ? (
                <span className="mensaje-error">{mensajeCampo('profesion')}</span>
              ) : null}
            </div>

              </>
            ) : null}

            {pasoActual === 2 ? (
              <>
            <div className="campo-formulario">
              <label htmlFor="emp-grupo_sanguineo">Grupo sanguíneo (incluye RH) *</label>
              <select
                id="emp-grupo_sanguineo"
                name="grupo_sanguineo"
                value={formulario.grupo_sanguineo}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('grupo_sanguineo') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {GRUPO_SANGUINEO.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {mensajeCampo('grupo_sanguineo') ? (
                <span className="mensaje-error">{mensajeCampo('grupo_sanguineo')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-discapacidad">Discapacidad *</label>
              <select
                id="emp-discapacidad"
                name="discapacidad"
                value={formulario.discapacidad}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('discapacidad') ? 'campo-error' : ''}
              >
                {DISCAPACIDAD.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('discapacidad') ? (
                <span className="mensaje-error">{mensajeCampo('discapacidad')}</span>
              ) : null}
            </div>

            <div className="campo-formulario campo-formulario--ancho">
              <label htmlFor="emp-descripcion">Descripción / perfil *</label>
              <textarea
                id="emp-descripcion"
                name="descripcion"
                rows={4}
                value={formulario.descripcion}
                onChange={manejarCambio}
                onKeyUp={manejarKeyUpValidar}
                maxLength={500}
                className={mensajeCampo('descripcion') ? 'campo-error' : ''}
              />
              {mensajeCampo('descripcion') ? (
                <span className="mensaje-error">{mensajeCampo('descripcion')}</span>
              ) : null}
            </div>
              </>
            ) : null}
          </div>
        </div>

      </FormularioPasos>
      </form>
    </Modal>
  );
}

export default ModalEmpleado;
