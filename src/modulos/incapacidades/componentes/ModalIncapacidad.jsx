import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import { validarNumeroDocumento, validarNombres } from '../../../utils/validaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import {
  createIncapacidad,
  updateIncapacidad,
  normalizarRegistroIncapacidad,
  codigoIncapacidadDesde,
  getTiposIncapacidad,
  getClasificacionesEnfermedad,
  extraerFilasCatalogo,
} from '../../../services/incapacidades';
import {
  codigoEmpleadoDesde,
  nombreCompletoEmpleado,
  buscarEmpleadoPorDocumento,
} from '../../../services/empleados';
import {
  ETIQUETAS_ESTADO_EDICION_INCAPACIDAD,
  estadoIncapacidadEdicionDesdeApi,
  estadoIncapacidadApiDesdeEtiquetaEdicion,
} from '../../../utils/incapacidadEstado';
import {
  fechaIngresoLaboralReferencia,
  mensajeSiFechaAntesDeContrato,
  mensajeSiFechaInvalidaParaEmpleadoLaboral,
} from '../../../utils/fechaIngresoLaboralEmpleado';
import { mergeClasificacionesEnfermedad } from '../../../utils/mergeCatalogos';
import { CLASIFICACION_CIE_REFERENCIA_SUPLEMENTO } from '../../../data/catalogosColombiaSuplemento';
import '../../../estilos/componentes/formulario-secciones.css';

const DESCRIPCION_MAX = 200;

const CAMPOS_FECHA_INCAP = ['fechaInicio', 'fechaFin', 'fechaRadicacion'];

function estadoFormularioVacio() {
  return {
    documento: '',
    nombre: '',
    tipoIncapacidad: '',
    fechaInicio: '',
    fechaFin: '',
    fechaRadicacion: '',
    diagnostico: '',
    cod_clasificacion_enfermedad: '',
    descripcion: '',
    estadoIncapacidadUi: '',
  };
}

function combinarDescripcionParaApi(diagnostico, notas) {
  const d = String(diagnostico ?? '').trim();
  const n = String(notas ?? '').trim();
  let s = '';
  if (d && n) s = `${d} | ${n}`;
  else s = d || n;
  if (s.length > DESCRIPCION_MAX) {
    return {
      ok: false,
      error: `Diagnóstico y notas no pueden superar ${DESCRIPCION_MAX} caracteres en total.`,
    };
  }
  return { ok: true, value: s || undefined };
}

function incapacidadApiAFormulario(raw, empleados) {
  const r = normalizarRegistroIncapacidad(raw) ?? raw;
  if (!r || typeof r !== 'object') return estadoFormularioVacio();
  let emp =
    r.empleado && typeof r.empleado === 'object' && !Array.isArray(r.empleado) ? r.empleado : null;
  if (!emp && r.cod_empleado != null && Array.isArray(empleados)) {
    emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(r.cod_empleado)) ?? null;
  }
  const codTipo =
    r.cod_tipo_incapacidad != null
      ? String(r.cod_tipo_incapacidad)
      : r.tipoIncapacidad?.cod_tipo_incapacidad != null
        ? String(r.tipoIncapacidad.cod_tipo_incapacidad)
        : '';
  const codClas =
    r.cod_clasificacion_enfermedad != null
      ? String(r.cod_clasificacion_enfermedad)
      : r.clasificacionEnfermedad?.cod_clasificacion_enfermedad != null
        ? String(r.clasificacionEnfermedad.cod_clasificacion_enfermedad)
        : '';

  return {
    documento: emp ? String(emp.doc_iden ?? '').trim() : '',
    nombre: emp ? nombreCompletoEmpleado(emp) : '',
    tipoIncapacidad: codTipo,
    fechaInicio: r.fecha_inicio ? String(r.fecha_inicio).slice(0, 10) : '',
    fechaFin: r.fecha_fin ? String(r.fecha_fin).slice(0, 10) : '',
    fechaRadicacion: r.fecha_radicacion ? String(r.fecha_radicacion).slice(0, 10) : '',
    diagnostico: r.descripcion != null ? String(r.descripcion) : '',
    cod_clasificacion_enfermedad: codClas,
    descripcion: '',
    estadoIncapacidadUi: estadoIncapacidadEdicionDesdeApi(r.estado_incapacidad),
  };
}

function construirPayloadIncapacidad(formulario, codEmpleado) {
  const cod = Number(codEmpleado);
  const tipoN = Number(formulario.tipoIncapacidad);
  const comb = combinarDescripcionParaApi(formulario.diagnostico, formulario.descripcion);
  if (!comb.ok) throw new Error(comb.error);

  const payload = {
    cod_empleado: cod,
    cod_tipo_incapacidad: tipoN,
    fecha_inicio: formulario.fechaInicio,
    fecha_fin: formulario.fechaFin,
  };
  if (comb.value !== undefined) payload.descripcion = comb.value;

  const fr = String(formulario.fechaRadicacion ?? '').trim();
  if (fr) payload.fecha_radicacion = fr;

  const cce = String(formulario.cod_clasificacion_enfermedad ?? '').trim();
  if (cce) {
    const n = Number(cce);
    if (Number.isFinite(n)) payload.cod_clasificacion_enfermedad = n;
  }

  const estadoUi = String(formulario.estadoIncapacidadUi ?? '').trim();
  if (estadoUi) {
    payload.estado_incapacidad = estadoIncapacidadApiDesdeEtiquetaEdicion(estadoUi);
  }

  return payload;
}

function ModalIncapacidad({ mostrar, cerrar, datosIncapacidad = null, empleados = [], contratos = [], alExito }) {
  const esEdicion = !!datosIncapacidad && codigoIncapacidadDesde(datosIncapacidad) != null;

  const [formulario, setFormulario] = useState(() => estadoFormularioVacio());
  const [tiposCatalogo, setTiposCatalogo] = useState([]);
  const [clasifCatalogo, setClasifCatalogo] = useState([]);
  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [pasoActual, setPasoActual] = useState(0);

  const codEdicion = useMemo(() => (esEdicion ? codigoIncapacidadDesde(datosIncapacidad) : null), [esEdicion, datosIncapacidad]);

  const calcularDias = () => {
    if (formulario.fechaInicio && formulario.fechaFin) {
      const inicio = new Date(`${formulario.fechaInicio}T12:00:00`);
      const fin = new Date(`${formulario.fechaFin}T12:00:00`);
      if (fin >= inicio) {
        const diffTime = Math.abs(fin - inicio);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 0;
  };

  const diasCalculados = calcularDias();

  useEffect(() => {
    if (!mostrar) return;
    let cancel = false;
    (async () => {
      try {
        const [st, sc] = await Promise.allSettled([getTiposIncapacidad(), getClasificacionesEnfermedad()]);
        if (cancel) return;
        if (st.status === 'fulfilled') setTiposCatalogo(extraerFilasCatalogo(st.value));
        else setTiposCatalogo([]);
        if (sc.status === 'fulfilled') setClasifCatalogo(extraerFilasCatalogo(sc.value));
        else setClasifCatalogo([]);
      } catch {
        if (!cancel) {
          setTiposCatalogo([]);
          setClasifCatalogo([]);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [mostrar]);

  useEffect(() => {
    if (!mostrar) return;
    setErrorGeneral('');
    setPasoActual(0);
    if (datosIncapacidad && codigoIncapacidadDesde(datosIncapacidad) != null) {
      setFormulario(incapacidadApiAFormulario(datosIncapacidad, empleados));
    } else {
      setFormulario(estadoFormularioVacio());
    }
    setErrores({});
    setCamposTocados({});
  }, [datosIncapacidad, mostrar, empleados]);

  const opcionesTipo = useMemo(
    () =>
      tiposCatalogo.map((t) => ({
        valor: String(t.cod_tipo_incapacidad),
        texto: t.nombre_tipo != null ? String(t.nombre_tipo) : String(t.cod_tipo_incapacidad),
      })),
    [tiposCatalogo],
  );

  const clasifCatalogoAmpliado = useMemo(
    () => mergeClasificacionesEnfermedad(clasifCatalogo, CLASIFICACION_CIE_REFERENCIA_SUPLEMENTO),
    [clasifCatalogo],
  );

  const opcionesClasif = useMemo(
    () =>
      clasifCatalogoAmpliado.map((c) => {
        const cod = c.codigo_cie10 != null ? String(c.codigo_cie10).trim() : '';
        const nom = c.nombre_clasificacion != null ? String(c.nombre_clasificacion).trim() : '';
        const texto = [cod, nom].filter(Boolean).join(' — ') || String(c.cod_clasificacion_enfermedad);
        return { valor: String(c.cod_clasificacion_enfermedad), texto };
      }),
    [clasifCatalogoAmpliado],
  );

  const empleadoRelacionado = useMemo(
    () => buscarEmpleadoPorDocumento(empleados, formulario.documento),
    [empleados, formulario.documento],
  );

  const fechaContratoReferencia = useMemo(
    () => fechaIngresoLaboralReferencia(empleadoRelacionado, contratos),
    [empleadoRelacionado, contratos],
  );

  const validarCampo = (
    nombre,
    valor,
    empleadoCtx = empleadoRelacionado,
    fechaContratoCtx = fechaContratoReferencia,
    formSnap = formulario,
  ) => {
    const f = formSnap || formulario;
    switch (nombre) {
      case 'documento':
        return validarNumeroDocumento(valor);
      case 'nombre':
        return validarNombres(valor);
      case 'tipoIncapacidad':
        return !valor ? 'Debe seleccionar un tipo de incapacidad' : null;
      case 'fechaInicio': {
        if (!valor) return 'La fecha de inicio es requerida';
        const c = mensajeSiFechaAntesDeContrato(valor, fechaContratoCtx);
        if (c) return c;
        return mensajeSiFechaInvalidaParaEmpleadoLaboral(valor, empleadoCtx);
      }
      case 'fechaFin': {
        if (!valor) return 'La fecha de fin es requerida';
        if (f.fechaInicio && valor < f.fechaInicio) {
          return 'La fecha de fin debe ser igual o posterior a la fecha de inicio';
        }
        const c = mensajeSiFechaAntesDeContrato(valor, fechaContratoCtx);
        if (c) return c;
        return mensajeSiFechaInvalidaParaEmpleadoLaboral(valor, empleadoCtx);
      }
      case 'fechaRadicacion': {
        if (!valor) return null;
        const c = mensajeSiFechaAntesDeContrato(valor, fechaContratoCtx);
        if (c) return c;
        const n = mensajeSiFechaInvalidaParaEmpleadoLaboral(valor, empleadoCtx);
        if (n) return n;
        if (f.fechaInicio && valor < f.fechaInicio) {
          return 'La fecha de radicación no puede ser anterior al inicio de la incapacidad.';
        }
        return null;
      }
      case 'diagnostico': {
        const comb = combinarDescripcionParaApi(valor, f.descripcion);
        if (!comb.ok) return comb.error;
        if (!String(valor ?? '').trim()) return 'El diagnóstico es requerido';
        return null;
      }
      case 'estadoIncapacidadUi':
        if (!esEdicion) return null;
        if (!valor) return 'Seleccione el estado';
        return null;
      default:
        return null;
    }
  };

  const validarAntesDeSiguiente = useCallback(
    (idx) => {
      const grupos = [
        esEdicion ? ['documento', 'nombre', 'estadoIncapacidadUi'] : ['documento', 'nombre'],
        ['tipoIncapacidad', 'fechaInicio', 'fechaFin', 'fechaRadicacion'],
        ['diagnostico'],
      ];
      if (idx < 0 || idx >= grupos.length) return true;

      const campos = grupos[idx];
      const todosTocados = {};
      const nuevosErrores = {};
      for (const c of campos) {
        todosTocados[c] = true;
        const err = validarCampo(c, formulario[c]);
        if (err) nuevosErrores[c] = err;
      }
      if (idx === 2) {
        const comb = combinarDescripcionParaApi(formulario.diagnostico, formulario.descripcion);
        if (!comb.ok) nuevosErrores.diagnostico = comb.error;
      }
      setCamposTocados((p) => ({ ...p, ...todosTocados }));
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    },
    [formulario, esEdicion, empleadoRelacionado, fechaContratoReferencia],
  );

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const esFechaIncap = CAMPOS_FECHA_INCAP.includes(name);
    const esDocumento = name === 'documento';

    let empDocumentoAct = null;
    if (esDocumento && !esEdicion) {
      empDocumentoAct = buscarEmpleadoPorDocumento(empleados, value);
    }

    setFormulario((prev) => {
      const next = { ...prev, [name]: value };
      if (esDocumento && !esEdicion) {
        const emp = empDocumentoAct;
        if (emp) next.nombre = nombreCompletoEmpleado(emp);
        else next.nombre = '';
      }
      return next;
    });

    const fechaContratoDoc = fechaIngresoLaboralReferencia(empDocumentoAct ?? undefined, contratos);

    if (esDocumento && !esEdicion) {
      setErrores((prev) => {
        const next = { ...prev };
        for (const fk of CAMPOS_FECHA_INCAP) {
          if (camposTocados[fk]) {
            next[fk] = validarCampo(fk, formulario[fk], empDocumentoAct, fechaContratoDoc);
          }
        }
        return next;
      });
    }

    if (camposTocados[name] || esFechaIncap || esDocumento) {
      const errCtxEmp = esDocumento && !esEdicion ? empDocumentoAct : empleadoRelacionado;
      const errCtxFecha = esDocumento && !esEdicion ? fechaContratoDoc : fechaContratoReferencia;
      setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value, errCtxEmp, errCtxFecha) }));
      if (esFechaIncap || esDocumento) {
        setCamposTocados((p) => ({ ...p, [name]: true }));
      }
    }

    if (name === 'fechaInicio') {
      const snap = { ...formulario, fechaInicio: value };
      setErrores((prev) => {
        const out = { ...prev };
        if (camposTocados.fechaFin && snap.fechaFin) {
          out.fechaFin = validarCampo(
            'fechaFin',
            snap.fechaFin,
            empleadoRelacionado,
            fechaContratoReferencia,
            snap,
          );
        }
        if (camposTocados.fechaRadicacion && snap.fechaRadicacion) {
          out.fechaRadicacion = validarCampo(
            'fechaRadicacion',
            snap.fechaRadicacion,
            empleadoRelacionado,
            fechaContratoReferencia,
            snap,
          );
        }
        return out;
      });
    }
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setCamposTocados((prev) => ({ ...prev, [name]: true }));
    const error = validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const calcularErroresIncapacidad = () => {
    const nuevosErrores = {};
    const todosTocados = {};
    const campos = [
      'documento',
      'nombre',
      ...(esEdicion ? ['estadoIncapacidadUi'] : []),
      'tipoIncapacidad',
      'fechaInicio',
      'fechaFin',
      'fechaRadicacion',
      'diagnostico',
    ];
    for (const campo of campos) {
      todosTocados[campo] = true;
      const error = validarCampo(campo, formulario[campo]);
      if (error) nuevosErrores[campo] = error;
    }
    const comb = combinarDescripcionParaApi(formulario.diagnostico, formulario.descripcion);
    if (!comb.ok) nuevosErrores.diagnostico = comb.error;
    return { nuevosErrores, todosTocados };
  };

  const pasoPorErroresIncap = (errs) => {
    const grupos = [
      esEdicion ? ['documento', 'nombre', 'estadoIncapacidadUi'] : ['documento', 'nombre'],
      ['tipoIncapacidad', 'fechaInicio', 'fechaFin', 'fechaRadicacion'],
      ['diagnostico'],
    ];
    for (let i = 0; i < grupos.length; i++) {
      if (grupos[i].some((c) => errs[c])) return i;
    }
    return 3;
  };

  const aplicarValidacionIncap = () => {
    const { nuevosErrores, todosTocados } = calcularErroresIncapacidad();
    setCamposTocados((prev) => ({ ...prev, ...todosTocados }));
    setErrores(nuevosErrores);
    return nuevosErrores;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevosErrores = aplicarValidacionIncap();
    if (Object.keys(nuevosErrores).length > 0) {
      setPasoActual(pasoPorErroresIncap(nuevosErrores));
      return;
    }

    const emp = buscarEmpleadoPorDocumento(empleados, formulario.documento);
    const codEmp = emp ? codigoEmpleadoDesde(emp) : null;
    if (codEmp == null) {
      setErrorGeneral('No se encontró un empleado con ese documento. Verifique el número o sincronice empleados.');
      return;
    }

    let payload;
    try {
      payload = construirPayloadIncapacidad(formulario, codEmp);
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : String(err));
      return;
    }

    setEnviando(true);
    try {
      if (esEdicion && codEdicion != null) {
        await updateIncapacidad(codEdicion, payload);
        await alExito?.('actualizado');
      } else {
        await createIncapacidad(payload);
        await alExito?.('creado');
      }
      cerrar();
    } catch (err) {
      setErrorGeneral(mensajeErrorApi(err));
    } finally {
      setEnviando(false);
    }
  };

  const obtenerClaseCampo = (nombreCampo) => {
    if (errores[nombreCampo]) return 'campo-error';
    if (camposTocados[nombreCampo] && !errores[nombreCampo] && formulario[nombreCampo]) {
      return 'campo-valido';
    }
    return '';
  };

  const mostrarMensaje = (nombreCampo) => {
    if (!camposTocados[nombreCampo]) return null;
    if (errores[nombreCampo]) {
      return <span className="campo-seccion-error">{errores[nombreCampo]}</span>;
    }
    if (formulario[nombreCampo]) {
      return <span className="campo-seccion-exito">✓ Correcto</span>;
    }
    return null;
  };

  const secciones = [
    {
      numero: 1,
      titulo: 'Identificación del Empleado',
      color: 'morado',
      campos: [
        {
          nombre: 'documento',
          etiqueta: 'Número de Documento',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej: 1128455781',
          hint: 'Ingrese el documento de identidad del empleado; el sistema lo usará para vincular el registro.',
          deshabilitado: esEdicion,
        },
        {
          nombre: 'nombre',
          etiqueta: 'Nombre Empleado',
          tipo: 'text',
          requerido: true,
          placeholder: 'Nombre completo del empleado',
          deshabilitado: true,
        },
        ...(esEdicion
          ? [
              {
                nombre: 'estadoIncapacidadUi',
                etiqueta: 'Estado de la incapacidad',
                tipo: 'select',
                requerido: true,
                selectSinVacio: true,
                opciones: ETIQUETAS_ESTADO_EDICION_INCAPACIDAD,
                hint: 'Solo Activa o Finalizada. Se guarda al actualizar.',
              },
            ]
          : []),
      ],
    },
    {
      numero: 2,
      titulo: 'Información de la Incapacidad',
      color: 'naranja',
      campos: [
        {
          nombre: 'tipoIncapacidad',
          etiqueta: 'Tipo de Incapacidad',
          tipo: 'select',
          requerido: true,
          placeholder: 'Seleccione el Tipo...',
          opciones: opcionesTipo,
        },
        {
          nombre: 'fechaInicio',
          etiqueta: 'Fecha de Inicio',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
          hint: 'Debe ser igual o posterior al ingreso al cargo (contrato) y a la mayoría de edad laboral.',
        },
        {
          nombre: 'fechaFin',
          etiqueta: 'Fecha de Fin',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
          hint: 'Igual o posterior al inicio; misma regla de contrato y edad laboral que el inicio.',
        },
        {
          nombre: 'fechaRadicacion',
          etiqueta: 'Fecha de radicación',
          tipo: 'date',
          requerido: false,
          placeholder: 'Opcional',
          hint: 'Si la deja vacía, puede registrarse automáticamente la fecha de hoy.',
        },
        {
          nombre: 'diasCalculados',
          etiqueta: 'Días Calculados',
          tipo: 'readonly',
          calculado: true,
          valorPorDefecto: diasCalculados.toString(),
          sufijo: 'días',
          hint: 'Se calculan automáticamente (inicio a fin, inclusive).',
        },
      ],
    },
    {
      numero: 3,
      titulo: 'Diagnóstico Médico',
      color: 'morado',
      campos: [
        {
          nombre: 'diagnostico',
          etiqueta: 'Diagnóstico',
          tipo: 'textarea',
          requerido: true,
          placeholder: 'Describa el diagnóstico completo...',
          filas: 4,
          hint: `Texto de diagnóstico (máx. ${DESCRIPCION_MAX} caracteres junto con las notas).`,
        },
        {
          nombre: 'cod_clasificacion_enfermedad',
          etiqueta: 'Clasificación enfermedad (CIE)',
          tipo: 'select',
          requerido: false,
          placeholder: 'Opcional — catálogo',
          opciones: opcionesClasif,
        },
      ],
    },
  ];

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo={esEdicion ? 'Editar Incapacidad' : 'Registrar Nueva Incapacidad'}
    >
      <form onSubmit={manejarGuardar}>
        {errorGeneral ? (
          <div className="login-alerta login-alerta--error" style={{ marginBottom: 16 }} role="alert">
            <p className="login-alerta-mensaje">{errorGeneral}</p>
          </div>
        ) : null}

        <FormularioPasos
          pasos={[
            { numero: 1, titulo: 'Identificación del Empleado', color: 'morado' },
            { numero: 2, titulo: 'Información de la Incapacidad', color: 'naranja' },
            { numero: 3, titulo: 'Diagnóstico médico', color: 'morado' },
            { numero: 4, titulo: 'Notas y referencia de pagos', color: 'azul' },
          ]}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          onCancelar={cerrar}
          enviando={enviando}
          validarAntesDeSiguiente={validarAntesDeSiguiente}
          textoGuardar={esEdicion ? 'Actualizar Incapacidad' : 'Registrar Incapacidad'}
        >
          {pasoActual === 0 ? (
            <FormularioSecciones
              ocultarEncabezadosSeccion
              secciones={[secciones[0]]}
              valores={formulario}
              errores={errores}
              camposTocados={camposTocados}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              onKeyUp={manejarBlur}
              obtenerClaseCampo={obtenerClaseCampo}
              mostrarMensaje={mostrarMensaje}
            />
          ) : null}
          {pasoActual === 1 ? (
            <FormularioSecciones
              ocultarEncabezadosSeccion
              secciones={[secciones[1]]}
              valores={formulario}
              errores={errores}
              camposTocados={camposTocados}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              onKeyUp={manejarBlur}
              obtenerClaseCampo={obtenerClaseCampo}
              mostrarMensaje={mostrarMensaje}
            />
          ) : null}
          {pasoActual === 2 ? (
            <FormularioSecciones
              ocultarEncabezadosSeccion
              secciones={[secciones[2]]}
              valores={formulario}
              errores={errores}
              camposTocados={camposTocados}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              onKeyUp={manejarBlur}
              obtenerClaseCampo={obtenerClaseCampo}
              mostrarMensaje={mostrarMensaje}
            />
          ) : null}
          {pasoActual === 3 ? (
            <>
              <div className="seccion-descripcion">
                <div className="seccion-descripcion-header">
                  <h3 className="seccion-descripcion-titulo">Descripción y Notas</h3>
                </div>
                <p className="seccion-descripcion-instruccion">
                  Información adicional; se concatena con el diagnóstico en un solo campo descripcion (máx.{' '}
                  {DESCRIPCION_MAX} caracteres en total).
                </p>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  placeholder="Agregue alguna información adicional...."
                  rows="4"
                />
              </div>

              <div className="seccion-informacion">
                <h4 className="seccion-informacion-titulo">Información sobre Pagos de Incapacidades</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '16px' }}>
                  <div>
                    <h5 style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>
                      Enfermedad General (Origen Común):
                    </h5>
                    <ul className="seccion-informacion-lista" style={{ fontSize: '13px' }}>
                      <li>Días 1-2: Empresa paga 100%</li>
                      <li>Días 3-90: EPS paga 66.67%</li>
                      <li>Días 91-180: EPS paga 50%</li>
                      <li>Más de 180 días: Evaluación de invalidez</li>
                    </ul>
                  </div>
                  <div>
                    <h5 style={{ color: '#ff6a3a', fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>
                      Accidente/Enfermedad Laboral:
                    </h5>
                    <ul className="seccion-informacion-lista" style={{ fontSize: '13px' }}>
                      <li>Todos los días: ARL paga 100%</li>
                      <li>Desde el día 1 hasta recuperación</li>
                      <li>Sin límite de días</li>
                    </ul>
                  </div>
                  <div>
                    <h5 style={{ color: '#ef4444', fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>
                      Licencia de Maternidad:
                    </h5>
                    <ul className="seccion-informacion-lista" style={{ fontSize: '13px' }}>
                      <li>18 semanas (126 días)</li>
                      <li>EPS paga 100%</li>
                    </ul>
                  </div>
                  <div>
                    <h5 style={{ color: '#3b82f6', fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>
                      Licencia de Paternidad:
                    </h5>
                    <ul className="seccion-informacion-lista" style={{ fontSize: '13px' }}>
                      <li>2 semanas (14 días)</li>
                      <li>EPS paga 100%</li>
                    </ul>
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                  Los cálculos se realizan automáticamente según la normativa colombiana vigente
                </p>
              </div>
            </>
          ) : null}
        </FormularioPasos>
      </form>
    </Modal>
  );
}

export default ModalIncapacidad;
