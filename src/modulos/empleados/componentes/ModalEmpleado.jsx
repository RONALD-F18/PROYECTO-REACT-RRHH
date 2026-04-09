import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import {
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
import {
  validarCampoEmpleado,
  validarFormularioEmpleadoCompleto,
  CAMPOS_EMPLEADO_DEBOUNCE_MS,
  CAMPOS_EMPLEADO_VALIDACION_DEBOUNCED,
} from '../../../utils/validacionEmpleadoFormulario';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { alertaMensaje } from '../../../utils/alertasSwal';
import {
  createEmpleado,
  patchEmpleado,
  normalizarRegistroEmpleado,
  codigoEmpleadoDesde,
} from '../../../services/empleados';
import { getContratos, extraerFilasContratos, esContratoVigenteParaEmpleado } from '../../../services/contratos';
import { mergeCatalogoPorClave } from '../../../utils/mergeCatalogos';
import { BANCOS_COLOMBIA_SUPLEMENTO } from '../../../data/catalogosColombiaSuplemento';
import {
  TIPO_DOCUMENTO,
  TIPO_CUENTA,
  ESTADO_EMP,
  DISCAPACIDAD,
  ESTADO_CIVIL,
  GRUPO_SANGUINEO,
} from '../empleadoEnums';

import '../../../estilos/componentes/formulario-secciones.css';

function estadoInicialVacio() {
  return {
    nombre_empleado: '',
    apellidos_empleado: '',
    doc_iden: '',
    tipo_documento: '',
    fecha_nac: '',
    direccion: '',
    numero_telefono: '',
    correo_empleado: '',
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
    correo_empleado: String(e.correo_empleado ?? e.email ?? '').trim().slice(0, 120),
    numero_cuenta: e.numero_cuenta != null ? String(e.numero_cuenta) : '',
    tipo_cuenta: e.tipo_cuenta ? String(e.tipo_cuenta).toUpperCase() : '',
    cod_banco: e.cod_banco != null && e.cod_banco !== '' ? String(e.cod_banco) : '',
    estado_emp: (() => {
      const s = e.estado_emp ? String(e.estado_emp).toUpperCase() : 'ACTIVO';
      return s === 'INACTIVO' ? 'RETIRADO' : s;
    })(),
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
    correo_empleado: formulario.correo_empleado.trim(),
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

const CAMPOS_POR_PASO_EMPLEADO = [
  [
    'tipo_documento',
    'doc_iden',
    'nombre_empleado',
    'apellidos_empleado',
    'fecha_nac',
    'fec_exp_doc',
    'numero_telefono',
    'correo_empleado',
    'direccion',
    'nacionalidad',
    'estado_civil',
    'estado_emp',
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

  const bancosOpciones = useMemo(
    () => mergeCatalogoPorClave(bancos, BANCOS_COLOMBIA_SUPLEMENTO, 'cod_banco'),
    [bancos],
  );

  const codigosBancoPermitidos = useMemo(
    () => new Set(bancosOpciones.map((b) => String(b.cod_banco))),
    [bancosOpciones],
  );
  const ctxValidacionRef = useRef({ codigosBancoPermitidos });
  ctxValidacionRef.current = { codigosBancoPermitidos };

  const debounceTimersRef = useRef({});

  const cancelarDebounceCampo = useCallback((name) => {
    const t = debounceTimersRef.current[name];
    if (t) {
      clearTimeout(t);
      delete debounceTimersRef.current[name];
    }
  }, []);

  const aplicarErroresTrasCambio = useCallback((nombreCampo, estadoFusionado) => {
    setErrores((er) => {
      const ctx = ctxValidacionRef.current;
      const nuevos = { ...er };
      const campos = new Set([nombreCampo]);
      if (nombreCampo === 'tipo_documento' || nombreCampo === 'fecha_nac') {
        ['doc_iden', 'fecha_nac', 'fec_exp_doc'].forEach((c) => campos.add(c));
      }
      if (nombreCampo === 'doc_iden') {
        campos.add('fec_exp_doc');
      }
      if (nombreCampo === 'fec_exp_doc') {
        campos.add('fec_exp_doc');
      }
      for (const c of campos) {
        const m = validarCampoEmpleado(c, estadoFusionado, ctx);
        if (m) nuevos[c] = m;
        else delete nuevos[c];
      }
      return nuevos;
    });
  }, []);

  const programarValidacionDebounced = useCallback(
    (name) => {
      cancelarDebounceCampo(name);
      debounceTimersRef.current[name] = setTimeout(() => {
        delete debounceTimersRef.current[name];
        aplicarErroresTrasCambio(name, formRef.current);
      }, CAMPOS_EMPLEADO_DEBOUNCE_MS);
    },
    [aplicarErroresTrasCambio, cancelarDebounceCampo],
  );

  const manejarBlurCampo = useCallback(
    (e) => {
      const name = e.target?.name;
      if (!name) return;
      setErroresApi((p) => {
        if (!p[name]) return p;
        const n = { ...p };
        delete n[name];
        return n;
      });
      cancelarDebounceCampo(name);
      aplicarErroresTrasCambio(name, formRef.current);
    },
    [aplicarErroresTrasCambio, cancelarDebounceCampo],
  );

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((id) => clearTimeout(id));
      debounceTimersRef.current = {};
    };
  }, []);

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
          case 'correo_empleado':
            next.correo_empleado = String(value).slice(0, 120);
            break;
          default:
            next[name] = value;
        }
      }
      const usarDebounce = CAMPOS_EMPLEADO_VALIDACION_DEBOUNCED.includes(name);
      queueMicrotask(() => {
        if (usarDebounce) programarValidacionDebounced(name);
        else aplicarErroresTrasCambio(name, next);
      });
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
        'tipo_documento',
        'doc_iden',
        'nombre_empleado',
        'apellidos_empleado',
        'fecha_nac',
        'fec_exp_doc',
        'numero_telefono',
        'correo_empleado',
        'direccion',
        'nacionalidad',
        'estado_civil',
        'estado_emp',
      ],
      ['cod_banco', 'numero_cuenta', 'tipo_cuenta', 'profesion'],
      ['grupo_sanguineo', 'discapacidad', 'descripcion'],
    ];

    const campos = camposPorPaso[idx] ?? [];
    const nuevosErrores = {};
    const ctx = { codigosBancoPermitidos };
    for (const c of campos) {
      const m = validarCampoEmpleado(c, formulario, ctx);
      if (m) nuevosErrores[c] = m;
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setErroresApi({});
    const v = validarFormularioEmpleadoCompleto(formulario, { codigosBancoPermitidos });
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
        if (parcial.estado_emp === 'RETIRADO') {
          const jsonCtr = await getContratos();
          const filas = extraerFilasContratos(jsonCtr);
          const codEmp = Number(codEdicion);
          const tieneVigente = filas.some(
            (c) =>
              c &&
              Number(c.cod_empleado) === codEmp &&
              esContratoVigenteParaEmpleado(c.estado_contrato),
          );
          if (tieneVigente) {
            await alertaMensaje({
              titulo: 'No se puede marcar como retirado',
              texto:
                'Este empleado tiene al menos un contrato vigente (ACTIVO). Finaliza ese contrato en el módulo de Contratos antes de marcar al empleado como Retirado.',
              icon: 'warning',
            });
            return;
          }
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
              <label htmlFor="emp-tipo_documento">Tipo de documento *</label>
              <select
                id="emp-tipo_documento"
                name="tipo_documento"
                value={formulario.tipo_documento}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
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
              <label htmlFor="emp-doc_iden">Número de documento *</label>
              <input
                id="emp-doc_iden"
                name="doc_iden"
                value={formulario.doc_iden}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
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
              <label htmlFor="emp-nombre_empleado">Nombre *</label>
              <input
                id="emp-nombre_empleado"
                name="nombre_empleado"
                value={formulario.nombre_empleado}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
                onKeyDown={prevenirSiNoEsLetrasNombre}
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
                onBlur={manejarBlurCampo}
                onKeyDown={prevenirSiNoEsLetrasNombre}
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
                onBlur={manejarBlurCampo}
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
                onBlur={manejarBlurCampo}
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
                onBlur={manejarBlurCampo}
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
              <label htmlFor="emp-correo_empleado">Correo electrónico *</label>
              <input
                id="emp-correo_empleado"
                name="correo_empleado"
                type="email"
                value={formulario.correo_empleado}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
                maxLength={120}
                autoComplete="email"
                className={mensajeCampo('correo_empleado') ? 'campo-error' : ''}
              />
              {mensajeCampo('correo_empleado') ? (
                <span className="mensaje-error">{mensajeCampo('correo_empleado')}</span>
              ) : null}
            </div>
            <div className="campo-formulario">
              <label htmlFor="emp-direccion">Dirección *</label>
              <input
                id="emp-direccion"
                name="direccion"
                value={formulario.direccion}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
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
                onBlur={manejarBlurCampo}
                onKeyDown={prevenirSiNoEsNacionalidad}
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
                onBlur={manejarBlurCampo}
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
            <div className="campo-formulario">
              <label htmlFor="emp-estado_emp">Estado en la empresa *</label>
              <select
                id="emp-estado_emp"
                name="estado_emp"
                value={formulario.estado_emp}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
                onKeyUp={manejarKeyUpValidar}
              >
                {ESTADO_EMP.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </div>
              </>
            ) : null}
          </div>

          <div className="columna-derecha" style={{ display: pasoActual !== 0 ? 'flex' : 'none' }}>
            {pasoActual === 1 ? (
              <>
            <div className="campo-formulario">
              <label htmlFor="emp-cod_banco">Banco (opcional)</label>
              <select
                id="emp-cod_banco"
                name="cod_banco"
                value={formulario.cod_banco}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
                onKeyUp={manejarKeyUpValidar}
                className={mensajeCampo('cod_banco') ? 'campo-error' : ''}
              >
                <option value="">Sin especificar</option>
                {bancosOpciones.map((b) => (
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
                onBlur={manejarBlurCampo}
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
                onBlur={manejarBlurCampo}
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
              <label htmlFor="emp-profesion">Profesión *</label>
              <input
                id="emp-profesion"
                name="profesion"
                value={formulario.profesion}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
                onKeyDown={prevenirSiNoEsProfesion}
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
                onBlur={manejarBlurCampo}
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
                onBlur={manejarBlurCampo}
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
              <label htmlFor="emp-descripcion">Descripción / perfil (opcional)</label>
              <textarea
                id="emp-descripcion"
                name="descripcion"
                rows={4}
                value={formulario.descripcion}
                onChange={manejarCambio}
                onBlur={manejarBlurCampo}
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
