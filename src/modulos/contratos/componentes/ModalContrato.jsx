import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import {
  createContrato,
  patchContrato,
  normalizarRegistroContrato,
  codigoContratoDesde,
} from '../../../services/contratos';
import { nombreCompletoEmpleado, codigoEmpleadoDesde } from '../../../services/empleados';
import { nombreCargoDesde, codigoCargoDesde } from '../../../services/cargos';
import {
  EDAD_MINIMA_LABORAL_COLOMBIA,
  addYearsCalendar,
  parseFechaSoloDia,
} from '../../../utils/validacionEmpleadoFormulario';
import {
  TIPO_CONTRATO_OPCIONES,
  FORMA_DE_PAGO_OPCIONES,
  MODALIDAD_TRABAJO_OPCIONES,
  HORARIO_TRABAJO_OPCIONES,
  ESTADO_CONTRATO,
} from '../contratoEnums';
import { mergeCatalogoPorClave } from '../../../utils/mergeCatalogos';
import { CARGOS_REFERENCIA_SUPLEMENTO } from '../../../data/catalogosColombiaSuplemento';

import '../../../estilos/componentes/formulario-secciones.css';

function estadoInicialVacio() {
  return {
    doc_iden: '',
    cod_empleado: '',
    tipo_contrato: 'Término fijo',
    forma_de_pago: 'Consignación',
    fecha_ingreso: '',
    fecha_fin: '',
    salario_base: '',
    cod_cargo: '',
    modalidad_trabajo: 'Presencial',
    horario_trabajo: HORARIO_TRABAJO_OPCIONES[0].valor,
    auxilio_transporte: false,
    descripcion: '',
    estado_contrato: 'ACTIVO',
    _cargosExtra: [],
  };
}

function contratoApiAFormulario(raw, cargosLista) {
  const c = normalizarRegistroContrato(raw) ?? raw;
  if (!c || typeof c !== 'object') return estadoInicialVacio();
  const emp = c.empleado && typeof c.empleado === 'object' ? c.empleado : null;
  const cargoObj = c.cargo && typeof c.cargo === 'object' ? c.cargo : null;
  const codCar = c.cod_cargo != null ? String(c.cod_cargo) : cargoObj ? String(codigoCargoDesde(cargoObj) ?? '') : '';
  const nombCar = nombreCargoDesde(cargoObj);
  const opcionCargo =
    codCar &&
    !cargosLista.some((x) => String(x.cod_cargo) === codCar) &&
    nombCar &&
    nombCar !== '—'
      ? [{ cod_cargo: codCar, nomb_cargo: nombCar }]
      : [];
  return {
    doc_iden: emp ? String(emp.doc_iden ?? '').trim() : '',
    cod_empleado: c.cod_empleado != null ? String(c.cod_empleado) : '',
    tipo_contrato: c.tipo_contrato ? String(c.tipo_contrato) : '',
    forma_de_pago: c.forma_de_pago ? String(c.forma_de_pago) : '',
    fecha_ingreso: c.fecha_ingreso ? String(c.fecha_ingreso).slice(0, 10) : '',
    fecha_fin: c.fecha_fin ? String(c.fecha_fin).slice(0, 10) : '',
    salario_base: c.salario_base != null && c.salario_base !== '' ? Number(c.salario_base) : '',
    cod_cargo: codCar,
    modalidad_trabajo: c.modalidad_trabajo ? String(c.modalidad_trabajo) : '',
    horario_trabajo: c.horario_trabajo ? String(c.horario_trabajo) : '',
    auxilio_transporte: Boolean(c.auxilio_transporte),
    descripcion: c.descripcion != null ? String(c.descripcion) : '',
    estado_contrato: (() => {
      const u = c.estado_contrato ? String(c.estado_contrato).toUpperCase() : 'ACTIVO';
      return u === 'INACTIVO' ? 'FINALIZADO' : u;
    })(),
    _cargosExtra: opcionCargo,
  };
}

function valoresPayloadEquivalentes(a, b) {
  if (a === b) return true;
  const vacio = (v) => v === null || v === undefined || v === '';
  if (vacio(a) && vacio(b)) return true;
  if (typeof a === 'boolean' || typeof b === 'boolean') return Boolean(a) === Boolean(b);
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a);
    const nb = Number(b);
    return !Number.isNaN(na) && !Number.isNaN(nb) && na === nb;
  }
  return String(a).trim() === String(b).trim();
}

function construirPayloadParcialEdicion(payloadActual, payloadInicial) {
  if (payloadInicial == null || typeof payloadInicial !== 'object') return payloadActual;
  const diff = {};
  const claves = new Set([...Object.keys(payloadActual), ...Object.keys(payloadInicial)]);
  for (const k of claves) {
    if (k.startsWith('_')) continue;
    if (!valoresPayloadEquivalentes(payloadActual[k], payloadInicial[k])) {
      diff[k] = payloadActual[k];
    }
  }
  return diff;
}

function construirPayloadApi(formulario) {
  const codEmp = parseInt(formulario.cod_empleado, 10);
  const codCar = parseInt(formulario.cod_cargo, 10);
  const sal = formulario.salario_base === '' ? NaN : Number(formulario.salario_base);
  return {
    tipo_contrato: formulario.tipo_contrato.trim(),
    cod_empleado: codEmp,
    forma_de_pago: formulario.forma_de_pago.trim(),
    fecha_ingreso: formulario.fecha_ingreso,
    fecha_fin: formulario.fecha_fin.trim() === '' ? null : formulario.fecha_fin.trim(),
    salario_base: sal,
    cod_cargo: codCar,
    modalidad_trabajo: formulario.modalidad_trabajo.trim(),
    horario_trabajo: formulario.horario_trabajo.trim(),
    auxilio_transporte: Boolean(formulario.auxilio_transporte),
    descripcion: formulario.descripcion.trim() === '' ? null : formulario.descripcion.trim(),
    estado_contrato: String(formulario.estado_contrato || 'ACTIVO').toUpperCase(),
  };
}

function validar(formulario, esEdicion, empleadoRelacionado = null) {
  const e = {};
  if (!esEdicion) {
    const doc = String(formulario.doc_iden ?? '').trim();
    if (!doc) e.doc_iden = 'Ingrese el documento del empleado.';
    else if (!/^\d+$/.test(doc)) e.doc_iden = 'El documento debe contener solo dígitos.';
    else if (doc.length < 5 || doc.length > 10) e.doc_iden = 'El documento debe tener entre 5 y 10 dígitos.';
    if (!formulario.cod_empleado) e.cod_empleado = 'No se encontró un empleado con ese documento.';
  }
  if (!formulario.tipo_contrato.trim()) e.tipo_contrato = 'Seleccione o indique el tipo de contrato.';
  if (!formulario.forma_de_pago.trim()) e.forma_de_pago = 'Indique la forma de pago.';
  if (!formulario.fecha_ingreso) e.fecha_ingreso = 'La fecha de ingreso es obligatoria.';
  if (formulario.fecha_ingreso) {
    const fechaIngreso = parseFechaSoloDia(formulario.fecha_ingreso);
    const fechaNac = parseFechaSoloDia(empleadoRelacionado?.fecha_nac);
    if (fechaIngreso && fechaNac) {
      if (fechaIngreso < fechaNac) {
        e.fecha_ingreso = 'La fecha de ingreso no puede ser anterior a la fecha de nacimiento.';
      } else {
        const minIngresoLegal = addYearsCalendar(fechaNac, EDAD_MINIMA_LABORAL_COLOMBIA);
        if (minIngresoLegal && fechaIngreso < minIngresoLegal) {
          e.fecha_ingreso = `La fecha de ingreso debe ser igual o posterior a cumplir ${EDAD_MINIMA_LABORAL_COLOMBIA} años.`;
        }
      }
    }
  }
  if (!formulario.cod_cargo) e.cod_cargo = 'Seleccione el cargo.';
  if (!formulario.modalidad_trabajo.trim()) e.modalidad_trabajo = 'Indique la modalidad.';
  if (!formulario.horario_trabajo.trim()) e.horario_trabajo = 'Indique el horario de trabajo.';
  const sal = formulario.salario_base === '' ? NaN : Number(formulario.salario_base);
  if (Number.isNaN(sal) || sal < 0) e.salario_base = 'Ingrese un salario válido (entero, sin decimales).';
  if (formulario.fecha_fin && formulario.fecha_ingreso) {
    if (formulario.fecha_fin < formulario.fecha_ingreso) {
      e.fecha_fin = 'Debe ser igual o posterior a la fecha de ingreso.';
    }
  }
  return e;
}

const CAMPOS_POR_PASO_CONTRATO = [
  ['doc_iden', 'cod_empleado', 'tipo_contrato', 'forma_de_pago', 'fecha_ingreso', 'fecha_fin', 'estado_contrato'],
  ['salario_base', 'cod_cargo', 'modalidad_trabajo', 'horario_trabajo'],
  ['descripcion'],
];

function mensajePrimeroDesdeErrorApi(val) {
  if (val == null) return '';
  if (Array.isArray(val)) {
    const s = val.find((m) => m != null && String(m).trim() !== '');
    return s != null ? String(s) : '';
  }
  if (typeof val === 'string') return val.trim();
  return String(val);
}

function campoTieneErrorApiContrato(campo, erroresApi) {
  const x = erroresApi?.[campo];
  if (x == null) return false;
  if (Array.isArray(x)) return x.some((m) => m != null && String(m).trim() !== '');
  if (typeof x === 'string') return x.trim().length > 0;
  return true;
}

function primerPasoConErroresContrato(erroresCliente, erroresApi) {
  const tiene = (c) => Boolean(erroresCliente?.[c]) || campoTieneErrorApiContrato(c, erroresApi);
  for (let i = 0; i < CAMPOS_POR_PASO_CONTRATO.length; i++) {
    if (CAMPOS_POR_PASO_CONTRATO[i].some(tiene)) return i;
  }
  const keys = new Set([...Object.keys(erroresCliente || {}), ...Object.keys(erroresApi || {})]);
  for (const k of keys) {
    if (tiene(k)) return 0;
  }
  return 0;
}

function empleadoPorDocumento(empleados, doc) {
  const t = String(doc || '').trim();
  if (!t) return null;
  return empleados.find((x) => String(x.doc_iden ?? '').trim() === t) ?? null;
}

function empleadoDesdeContratoEdicion(datosContrato) {
  const r = normalizarRegistroContrato(datosContrato) ?? datosContrato;
  if (!r || typeof r !== 'object') return null;
  if (r.empleado && typeof r.empleado === 'object' && !Array.isArray(r.empleado)) return r.empleado;
  return null;
}

function ModalContrato({ mostrar, cerrar, datosContrato, empleados, cargos, alExito }) {
  const esEdicion = datosContrato != null && codigoContratoDesde(datosContrato) != null;
  const codEdicion = esEdicion ? codigoContratoDesde(datosContrato) : null;

  const [formulario, setFormulario] = useState(() => estadoInicialVacio());
  const payloadInicialEdicionRef = useRef(null);
  const [errores, setErrores] = useState({});
  const [erroresApi, setErroresApi] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);

  const cargosConReferencia = useMemo(
    () => mergeCatalogoPorClave(Array.isArray(cargos) ? cargos : [], CARGOS_REFERENCIA_SUPLEMENTO, 'cod_cargo'),
    [cargos],
  );

  const cargosOpciones = [
    ...((formulario._cargosExtra && Array.isArray(formulario._cargosExtra) ? formulario._cargosExtra : []) || []),
    ...cargosConReferencia,
  ];
  const cargosUnicos = [];
  const vistos = new Set();
  for (const c of cargosOpciones) {
    if (!c || c.cod_cargo == null) continue;
    const k = String(c.cod_cargo);
    if (vistos.has(k)) continue;
    vistos.add(k);
    cargosUnicos.push(c);
  }

  const sincronizarDesdeProps = useCallback(() => {
    if (!mostrar) return;
    if (esEdicion && datosContrato) {
      const f = contratoApiAFormulario(datosContrato, cargosConReferencia);
      const { _cargosExtra, ...rest } = f;
      setFormulario({ ...rest, _cargosExtra });
      const payload = construirPayloadApi(rest);
      payloadInicialEdicionRef.current = { ...payload };
    } else {
      setFormulario(estadoInicialVacio());
      payloadInicialEdicionRef.current = null;
    }
    setErrores({});
    setErroresApi({});
    setErrorGeneral('');
    setPasoActual(0);
  }, [mostrar, esEdicion, datosContrato, cargosConReferencia]);

  useEffect(() => {
    sincronizarDesdeProps();
  }, [sincronizarDesdeProps]);

  useEffect(() => {
    if (!mostrar || esEdicion) return;
    const emp = empleadoPorDocumento(empleados, formulario.doc_iden);
    setFormulario((prev) => ({
      ...prev,
      cod_empleado: emp ? String(codigoEmpleadoDesde(emp) ?? '') : '',
    }));
  }, [mostrar, esEdicion, formulario.doc_iden, empleados]);

  const opcionesTipoContrato = useMemo(() => {
    const v = formulario.tipo_contrato;
    const o = [...TIPO_CONTRATO_OPCIONES];
    if (v && !o.some((x) => x.valor === v)) o.unshift({ valor: v, etiqueta: v });
    return o;
  }, [formulario.tipo_contrato]);

  const opcionesFormaPago = useMemo(() => {
    const v = formulario.forma_de_pago;
    const o = [...FORMA_DE_PAGO_OPCIONES];
    if (v && !o.some((x) => x.valor === v)) o.unshift({ valor: v, etiqueta: v });
    return o;
  }, [formulario.forma_de_pago]);

  const opcionesModalidad = useMemo(() => {
    const v = formulario.modalidad_trabajo;
    const o = [...MODALIDAD_TRABAJO_OPCIONES];
    if (v && !o.some((x) => x.valor === v)) o.unshift({ valor: v, etiqueta: v });
    return o;
  }, [formulario.modalidad_trabajo]);

  const empleadoRelacionado = esEdicion
    ? empleadoDesdeContratoEdicion(datosContrato)
    : empleadoPorDocumento(empleados, formulario.doc_iden);

  const nombreEmpleadoMostrar = esEdicion
    ? nombreCompletoEmpleado(
        normalizarRegistroContrato(datosContrato)?.empleado ?? datosContrato?.empleado ?? {},
      )
    : nombreCompletoEmpleado(empleadoRelacionado ?? {});

  const manejarCambio = (ev) => {
    const { name, value, type, checked } = ev.target;
    setFormulario((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Validación inmediata de fechas (incluye reglas legales de edad mínima).
      if (name === 'fecha_ingreso' || name === 'fecha_fin') {
        const v = validar(next, esEdicion, empleadoRelacionado);
        setErrores((prevErr) => {
          const nextErr = { ...prevErr };
          if (v.fecha_ingreso) nextErr.fecha_ingreso = v.fecha_ingreso;
          else delete nextErr.fecha_ingreso;
          if (v.fecha_fin) nextErr.fecha_fin = v.fecha_fin;
          else delete nextErr.fecha_fin;
          return nextErr;
        });
      }

      return next;
    });
  };

  const manejarSalario = (ev) => {
    const digits = ev.target.value.replace(/\D/g, '');
    setFormulario((prev) => ({
      ...prev,
      salario_base: digits === '' ? '' : parseInt(digits, 10),
    }));
  };

  const salarioTexto =
    formulario.salario_base === '' || formulario.salario_base == null
      ? ''
      : new Intl.NumberFormat('es-CO').format(Number(formulario.salario_base));

  const mensajeCampo = (campo) =>
    errores[campo] || (erroresApi[campo] != null ? mensajePrimeroDesdeErrorApi(erroresApi[campo]) : '');

  const validarAntesDeSiguiente = (idx) => {
    const camposPorPaso = [
      ['doc_iden', 'cod_empleado', 'tipo_contrato', 'forma_de_pago', 'fecha_ingreso', 'fecha_fin', 'estado_contrato'],
      ['salario_base', 'cod_cargo', 'modalidad_trabajo', 'horario_trabajo'],
    ];

    const campos = camposPorPaso[idx] ?? [];
    const v = validar(formulario, esEdicion, empleadoRelacionado);

    const subset = {};
    for (const c of campos) {
      if (v[c]) subset[c] = v[c];
    }
    setErrores(subset);
    return Object.keys(subset).length === 0;
  };

  const manejarGuardar = async (ev) => {
    ev.preventDefault();
    setErrorGeneral('');
    setErroresApi({});
    const v = validar(formulario, esEdicion, empleadoRelacionado);
    setErrores(v);
    if (Object.keys(v).length > 0) {
      setPasoActual(primerPasoConErroresContrato(v, {}));
      return;
    }

    const payload = construirPayloadApi(formulario);
    setEnviando(true);
    try {
      if (esEdicion && codEdicion != null) {
        let parcial = construirPayloadParcialEdicion(payload, payloadInicialEdicionRef.current);
        if (Object.keys(parcial).length === 0) {
          setErrorGeneral('No hay cambios que guardar.');
          return;
        }
        if ('fecha_fin' in parcial || 'fecha_ingreso' in parcial) {
          parcial = {
            ...parcial,
            fecha_ingreso: payload.fecha_ingreso,
            fecha_fin: payload.fecha_fin,
          };
        }
        await patchContrato(codEdicion, parcial);
        await alExito?.('actualizado');
      } else {
        await createContrato(payload);
        await alExito?.('creado');
      }
      cerrar();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 422 && data?.errors && typeof data.errors === 'object') {
        setErroresApi(data.errors);
        setErrorGeneral('Revisa los campos marcados.');
        setPasoActual(primerPasoConErroresContrato({}, data.errors));
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
      titulo={esEdicion ? 'Editar contrato' : 'Registrar contrato'}
      classNameContenedor="modal-contenido--contrato-form"
    >
      <form className="formulario-contrato-api" onSubmit={manejarGuardar}>
        {errorGeneral ? (
          <div className="contrato-modal-alerta contrato-modal-alerta--error" role="alert">
            <strong>Error</strong>
            <p>{errorGeneral}</p>
          </div>
        ) : null}

        <FormularioPasos
          pasos={[
            { numero: 1, titulo: 'Empleado y contrato', color: 'morado' },
            { numero: 2, titulo: 'Condiciones laborales', color: 'azul' },
            { numero: 3, titulo: 'Descripción', color: 'verde' },
          ]}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          onCancelar={cerrar}
          enviando={enviando}
          textoGuardar={esEdicion ? 'Actualizar' : 'Guardar'}
          validarAntesDeSiguiente={validarAntesDeSiguiente}
        >
          <div className="formulario-grid-doble formulario-contrato-grid">
          <div
            className={`columna-izquierda${pasoActual === 0 ? ' columna-izquierda--contrato-activa' : ''}`}
          >
            <div className="campo-formulario">
              <label htmlFor="ctr-doc_iden">Número de documento *</label>
              <input
                id="ctr-doc_iden"
                name="doc_iden"
                value={formulario.doc_iden}
                onChange={manejarCambio}
                disabled={esEdicion}
                maxLength={20}
                autoComplete="off"
                inputMode="numeric"
                placeholder="Ej: 1128455781"
                className={mensajeCampo('doc_iden') || mensajeCampo('cod_empleado') ? 'campo-error' : ''}
              />
              <span className="campo-ayuda">Ingrese el documento de identidad del empleado.</span>
              {mensajeCampo('doc_iden') ? <span className="mensaje-error">{mensajeCampo('doc_iden')}</span> : null}
              {mensajeCampo('cod_empleado') ? <span className="mensaje-error">{mensajeCampo('cod_empleado')}</span> : null}
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-cod_contrato">Código contrato</label>
              <input
                id="ctr-cod_contrato"
                value={esEdicion && codEdicion != null ? String(codEdicion) : ''}
                disabled
                placeholder="Se asigna al guardar"
                readOnly
              />
              <span className="campo-ayuda">Identificador generado por el sistema al registrar.</span>
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-nombre_empleado">Nombre empleado *</label>
              <input
                id="ctr-nombre_empleado"
                value={nombreEmpleadoMostrar === '—' ? '' : nombreEmpleadoMostrar}
                disabled
                placeholder="Se completa al validar el documento"
                readOnly
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-tipo_contrato">Tipo de contrato *</label>
              <select
                id="ctr-tipo_contrato"
                name="tipo_contrato"
                value={formulario.tipo_contrato}
                onChange={manejarCambio}
                className={mensajeCampo('tipo_contrato') ? 'campo-error' : ''}
              >
                {opcionesTipoContrato.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('tipo_contrato') ? <span className="mensaje-error">{mensajeCampo('tipo_contrato')}</span> : null}
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-forma_de_pago">Forma de pago *</label>
              <select
                id="ctr-forma_de_pago"
                name="forma_de_pago"
                value={formulario.forma_de_pago}
                onChange={manejarCambio}
                className={mensajeCampo('forma_de_pago') ? 'campo-error' : ''}
              >
                {opcionesFormaPago.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('forma_de_pago') ? <span className="mensaje-error">{mensajeCampo('forma_de_pago')}</span> : null}
            </div>

            <div className="formulario-contrato-fechas">
              <div className="campo-formulario">
                <label htmlFor="ctr-fecha_ingreso">Fecha de ingreso *</label>
                <input
                  id="ctr-fecha_ingreso"
                  type="date"
                  name="fecha_ingreso"
                  value={formulario.fecha_ingreso}
                  onChange={manejarCambio}
                  className={mensajeCampo('fecha_ingreso') ? 'campo-error' : ''}
                />
                {mensajeCampo('fecha_ingreso') ? <span className="mensaje-error">{mensajeCampo('fecha_ingreso')}</span> : null}
              </div>

              <div className="campo-formulario">
                <label htmlFor="ctr-fecha_fin">Fecha de fin</label>
                <input
                  id="ctr-fecha_fin"
                  type="date"
                  name="fecha_fin"
                  value={formulario.fecha_fin}
                  onChange={manejarCambio}
                  className={mensajeCampo('fecha_fin') ? 'campo-error' : ''}
                />
                <span className="campo-ayuda">Opcional si no hay terminación.</span>
                {mensajeCampo('fecha_fin') ? <span className="mensaje-error">{mensajeCampo('fecha_fin')}</span> : null}
              </div>
            </div>

            {esEdicion ? (
              <div className="campo-formulario campo-formulario-contrato-estado">
                <label htmlFor="ctr-estado_contrato">Estado del contrato</label>
                <select
                  id="ctr-estado_contrato"
                  name="estado_contrato"
                  value={formulario.estado_contrato}
                  onChange={manejarCambio}
                  className={mensajeCampo('estado_contrato') ? 'campo-error' : ''}
                >
                  {ESTADO_CONTRATO.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.etiqueta}
                    </option>
                  ))}
                </select>
                {mensajeCampo('estado_contrato') ? (
                  <span className="mensaje-error">{mensajeCampo('estado_contrato')}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            className={`columna-derecha${pasoActual !== 0 ? ' columna-derecha--contrato-activa' : ''}`}
          >
            <div style={{ display: pasoActual === 1 ? 'contents' : 'none' }}>
            <div className="formulario-contrato-bloque-doble">
            <div className="campo-formulario">
              <label htmlFor="ctr-salario_base">Salario base (COP) *</label>
              <input
                id="ctr-salario_base"
                name="salario_display"
                value={salarioTexto}
                onChange={manejarSalario}
                inputMode="numeric"
                placeholder="Ej: 1.300.000"
                autoComplete="off"
                className={mensajeCampo('salario_base') ? 'campo-error' : ''}
              />
              {mensajeCampo('salario_base') ? <span className="mensaje-error">{mensajeCampo('salario_base')}</span> : null}
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-cod_cargo">Cargo *</label>
              <select
                id="ctr-cod_cargo"
                name="cod_cargo"
                value={formulario.cod_cargo}
                onChange={manejarCambio}
                className={mensajeCampo('cod_cargo') ? 'campo-error' : ''}
              >
                <option value="">Seleccione</option>
                {cargosUnicos.map((c) => (
                  <option key={String(c.cod_cargo)} value={String(c.cod_cargo)}>
                    {c.nomb_cargo ?? c.nombre_cargo ?? `Cargo ${c.cod_cargo}`}
                  </option>
                ))}
              </select>
              {mensajeCampo('cod_cargo') ? <span className="mensaje-error">{mensajeCampo('cod_cargo')}</span> : null}
            </div>
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-modalidad_trabajo">Modalidad de trabajo *</label>
              <select
                id="ctr-modalidad_trabajo"
                name="modalidad_trabajo"
                value={formulario.modalidad_trabajo}
                onChange={manejarCambio}
                className={mensajeCampo('modalidad_trabajo') ? 'campo-error' : ''}
              >
                {opcionesModalidad.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
              {mensajeCampo('modalidad_trabajo') ? (
                <span className="mensaje-error">{mensajeCampo('modalidad_trabajo')}</span>
              ) : null}
            </div>

            <div className="campo-formulario">
              <label htmlFor="ctr-horario_trabajo">Horario de trabajo *</label>
              <select
                id="ctr-horario_trabajo"
                name="horario_trabajo"
                value={
                  HORARIO_TRABAJO_OPCIONES.some((o) => o.valor === formulario.horario_trabajo)
                    ? formulario.horario_trabajo
                    : '__otro__'
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__otro__') {
                    setFormulario((prev) => ({ ...prev, horario_trabajo: '' }));
                  } else {
                    setFormulario((prev) => ({ ...prev, horario_trabajo: v }));
                  }
                }}
                className={mensajeCampo('horario_trabajo') ? 'campo-error' : ''}
              >
                {HORARIO_TRABAJO_OPCIONES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
                <option value="__otro__">Otro (escribir abajo)</option>
              </select>
            </div>
            <div className="campo-formulario">
              <label htmlFor="ctr-horario_otro">Detalle de horario (si aplica)</label>
              <input
                id="ctr-horario_otro"
                name="horario_trabajo"
                value={
                  HORARIO_TRABAJO_OPCIONES.some((o) => o.valor === formulario.horario_trabajo)
                    ? ''
                    : formulario.horario_trabajo
                }
                onChange={(e) => setFormulario((prev) => ({ ...prev, horario_trabajo: e.target.value }))}
                placeholder="Ej: Lun - Vie 7:00 - 16:00"
                maxLength={150}
              />
              {mensajeCampo('horario_trabajo') ? (
                <span className="mensaje-error">{mensajeCampo('horario_trabajo')}</span>
              ) : null}
            </div>

            <div className="campo-formulario campo-formulario--checkbox">
              <label htmlFor="ctr-auxilio_transporte">
                <input
                  id="ctr-auxilio_transporte"
                  type="checkbox"
                  name="auxilio_transporte"
                  checked={Boolean(formulario.auxilio_transporte)}
                  onChange={manejarCambio}
                />
                Auxilio de transporte
              </label>
            </div>
          </div>

            <div style={{ display: pasoActual === 2 ? 'contents' : 'none' }}>
              <div className="campo-formulario campo-formulario--ancho">
                <label htmlFor="ctr-descripcion">Observaciones</label>
                <textarea
                  id="ctr-descripcion"
                  name="descripcion"
                  rows={4}
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  maxLength={2000}
                  placeholder="Detalles adicionales del contrato (opcional)"
                />
              </div>
            </div>
          </div>
        </div>

      </FormularioPasos>
      </form>
    </Modal>
  );
}

export default ModalContrato;
