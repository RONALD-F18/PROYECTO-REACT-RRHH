import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { confirmarCierreModal } from '../../../componentes/comunes/ConfirmCloseModal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import { validarNumeroDocumento, validarNombres } from '../../../utils/validaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { alertaError } from '../../../utils/alertasSwal';
import { createAfiliacion, updateAfiliacion, normalizarRegistroAfiliacion, codigoAfiliacionDesde } from '../../../services/afiliaciones';
import { codigoEmpleadoDesde, nombreCompletoEmpleado, empleadoPorDocumento } from '../../../services/empleados';
import {
  tipoRegimenApi,
  tipoRegimenFormDesdeApi,
  etiquetaEstadoAfiliacion,
  estadoAfiliacionDesdeEtiquetaUi,
  etiquetasEstadoAfiliacion,
  etiquetasTipoRegimen,
} from '../../../utils/afiliacionEstado';
import {
  EDAD_MINIMA_LABORAL_COLOMBIA,
  addYearsCalendar,
  parseFechaSoloDia,
} from '../../../utils/validacionEmpleadoFormulario';
import { mergeCatalogoPorClave } from '../../../utils/mergeCatalogos';
import { RIESGOS_LABORALES_SUPLEMENTO } from '../../../data/catalogosColombiaSuplemento';
import '../../../estilos/componentes/formulario-secciones.css';

/**
 * Misma regla que contratos: ninguna fecha laboral antes del nacimiento ni antes de la edad mínima laboral.
 */
function validarFechaAfiliacionLaboral(fechaStr, empleado) {
  const fecha = parseFechaSoloDia(fechaStr);
  const fechaNac = parseFechaSoloDia(empleado?.fecha_nac);
  if (!fecha || !fechaNac) return null;
  if (fecha < fechaNac) {
    return 'La fecha de afiliación no puede ser anterior a la fecha de nacimiento.';
  }
  const minLegal = addYearsCalendar(fechaNac, EDAD_MINIMA_LABORAL_COLOMBIA);
  if (minLegal && fecha < minLegal) {
    return `La fecha de afiliación debe ser igual o posterior a cumplir ${EDAD_MINIMA_LABORAL_COLOMBIA} años.`;
  }
  return null;
}

function validarFechaAfiliacionCampo(valor, empleado) {
  if (!valor) return 'La fecha de afiliación es requerida';
  return validarFechaAfiliacionLaboral(valor, empleado);
}

const CAMPOS_FECHA_AFILIACION = [
  'fechaAfiliacionEPS',
  'fechaAfiliacionPensiones',
  'fechaAfiliacionCesantias',
  'fechaAfiliacionARL',
  'fechaAfiliacionCaja',
];

function estadoVacio(codigoAuto) {
  return {
    cod_empleado: '',
    documento: '',
    nombre: '',
    codigoAfiliacion: codigoAuto,
    eps: '',
    tipoAfiliacion: '',
    fechaAfiliacionEPS: '',
    fondoPensiones: '',
    fechaAfiliacionPensiones: '',
    fondoCesantias: '',
    fechaAfiliacionCesantias: '',
    arl: '',
    claseRiesgo: '',
    fechaAfiliacionARL: '',
    cajaCompensacion: '',
    fechaAfiliacionCaja: '',
    descripcion: '',
    estadoAfiliacionUi: '',
  };
}

function afiliacionApiAFormulario(raw, empleados) {
  const r = normalizarRegistroAfiliacion(raw) ?? raw;
  if (!r || typeof r !== 'object') return estadoVacio('');
  let emp =
    r.empleado && typeof r.empleado === 'object' && !Array.isArray(r.empleado) ? r.empleado : null;
  if (!emp && r.cod_empleado != null && Array.isArray(empleados)) {
    emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(r.cod_empleado)) ?? null;
  }
  return {
    cod_empleado: r.cod_empleado != null ? String(r.cod_empleado) : '',
    documento: emp ? String(emp.doc_iden ?? '').trim() : '',
    nombre: emp ? nombreCompletoEmpleado(emp) : '',
    codigoAfiliacion: r.cod_afiliacion != null ? `AF-${r.cod_afiliacion}` : '',
    eps: r.cod_eps != null ? String(r.cod_eps) : '',
    tipoAfiliacion: tipoRegimenFormDesdeApi(r.tipo_regimen),
    fechaAfiliacionEPS: r.fecha_afiliacion_eps ? String(r.fecha_afiliacion_eps).slice(0, 10) : '',
    fondoPensiones: r.cod_fondo_pensiones != null ? String(r.cod_fondo_pensiones) : '',
    fechaAfiliacionPensiones: r.fecha_afiliacion_fondo_pensiones
      ? String(r.fecha_afiliacion_fondo_pensiones).slice(0, 10)
      : '',
    fondoCesantias: r.cod_fondo_cesantias != null ? String(r.cod_fondo_cesantias) : '',
    fechaAfiliacionCesantias: r.fecha_afiliacion_fondo_cesantias
      ? String(r.fecha_afiliacion_fondo_cesantias).slice(0, 10)
      : '',
    arl: r.cod_arl != null ? String(r.cod_arl) : '',
    claseRiesgo: r.cod_riesgo != null ? String(r.cod_riesgo) : '',
    fechaAfiliacionARL: r.fecha_afiliacion_arl ? String(r.fecha_afiliacion_arl).slice(0, 10) : '',
    cajaCompensacion: r.cod_caja_compensacion != null ? String(r.cod_caja_compensacion) : '',
    fechaAfiliacionCaja: r.fecha_afiliacion_caja ? String(r.fecha_afiliacion_caja).slice(0, 10) : '',
    descripcion: r.descripcion != null ? String(r.descripcion) : '',
    estadoAfiliacionUi: etiquetaEstadoAfiliacion(r.estado_afiliacion),
  };
}

function descripcionParaApi(v) {
  const s = String(v ?? '').trim();
  if (s.length > 0) return s.slice(0, 200);
  return 'Sin observaciones';
}

function construirPayloadAfiliacion(form, catalogos) {
  const estadoUi = String(form.estadoAfiliacionUi ?? '').trim();
  const estadoBd = estadoUi ? estadoAfiliacionDesdeEtiquetaUi(estadoUi, catalogos) : 'Activa';
  return {
    fecha_afiliacion_eps: form.fechaAfiliacionEPS,
    fecha_afiliacion_arl: form.fechaAfiliacionARL,
    fecha_afiliacion_caja: form.fechaAfiliacionCaja,
    fecha_afiliacion_fondo_pensiones: form.fechaAfiliacionPensiones,
    fecha_afiliacion_fondo_cesantias: form.fechaAfiliacionCesantias,
    estado_afiliacion: estadoBd,
    cod_eps: Number(form.eps),
    cod_riesgo: Number(form.claseRiesgo),
    cod_arl: Number(form.arl),
    cod_fondo_pensiones: Number(form.fondoPensiones),
    cod_fondo_cesantias: Number(form.fondoCesantias),
    cod_caja_compensacion: Number(form.cajaCompensacion),
    cod_empleado: Number(form.cod_empleado),
    descripcion: descripcionParaApi(form.descripcion),
    tipo_regimen: tipoRegimenApi(form.tipoAfiliacion, catalogos),
  };
}

function ModalAfiliacion({ mostrar, cerrar, datosAfiliacion = null, empleados = [], catalogos, alExito }) {
  const esEdicion = !!datosAfiliacion && codigoAfiliacionDesde(datosAfiliacion) != null;
  const codEdicion = esEdicion ? codigoAfiliacionDesde(datosAfiliacion) : null;

  const [formulario, setFormulario] = useState(() => estadoVacio(''));
  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [pasoActual, setPasoActual] = useState(0);

  const opcionesEPS = useMemo(
    () =>
      (catalogos?.eps ?? []).map((e) => ({
        valor: String(e.cod_eps),
        texto: e.nombre_eps ?? `EPS ${e.cod_eps}`,
      })),
    [catalogos],
  );
  const opcionesRiesgo = useMemo(() => {
    const merged = mergeCatalogoPorClave(catalogos?.riesgos ?? [], RIESGOS_LABORALES_SUPLEMENTO, 'cod_riesgo');
    return merged.map((r) => ({
      valor: String(r.cod_riesgo),
      texto: r.nombre_riesgo ?? `Riesgo ${r.cod_riesgo}`,
    }));
  }, [catalogos]);
  const opcionesARL = useMemo(
    () =>
      (catalogos?.arls ?? []).map((a) => ({
        valor: String(a.cod_arl),
        texto: a.nombre_arl ?? `ARL ${a.cod_arl}`,
      })),
    [catalogos],
  );
  const opcionesPensiones = useMemo(
    () =>
      (catalogos?.pensiones ?? []).map((p) => ({
        valor: String(p.cod_fondo_pensiones),
        texto: p.nombre_fondo_pension ?? `Fondo ${p.cod_fondo_pensiones}`,
      })),
    [catalogos],
  );
  const opcionesCesantias = useMemo(
    () =>
      (catalogos?.cesantias ?? []).map((c) => ({
        valor: String(c.cod_fondo_cesantias),
        texto: c.nombre_fondo_cesantia ?? `Cesantías ${c.cod_fondo_cesantias}`,
      })),
    [catalogos],
  );
  const opcionesCaja = useMemo(
    () =>
      (catalogos?.compensaciones ?? []).map((x) => ({
        valor: String(x.cod_caja_compensacion),
        texto: x.nombre_caja_compensacion ?? `Caja ${x.cod_caja_compensacion}`,
      })),
    [catalogos],
  );

  useEffect(() => {
    if (!mostrar) return;
    setErrorGeneral('');
    setPasoActual(0);
    if (datosAfiliacion && codigoAfiliacionDesde(datosAfiliacion) != null) {
      const r = normalizarRegistroAfiliacion(datosAfiliacion) ?? datosAfiliacion;
      setFormulario(afiliacionApiAFormulario(r, empleados));
    } else {
      const codigoAuto = `AF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
      setFormulario(estadoVacio(codigoAuto));
    }
    setErrores({});
    setCamposTocados({});
  }, [datosAfiliacion, mostrar, empleados]);

  const opcionesTipoAfiliacion = useMemo(
    () => etiquetasTipoRegimen(catalogos),
    [catalogos],
  );

  const opcionesEstadoAfiliacion = useMemo(
    () => etiquetasEstadoAfiliacion(catalogos),
    [catalogos],
  );

  const empleadoRelacionado = useMemo(() => {
    if (!formulario.cod_empleado) return null;
    const cod = String(formulario.cod_empleado).trim();
    return empleados.find((e) => String(codigoEmpleadoDesde(e) ?? '').trim() === cod) ?? null;
  }, [empleados, formulario.cod_empleado]);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'documento':
        return validarNumeroDocumento(valor);
      case 'nombre':
        return validarNombres(valor);
      case 'eps':
      case 'fondoPensiones':
      case 'fondoCesantias':
      case 'arl':
      case 'cajaCompensacion':
        return !valor ? 'Debe seleccionar una opción' : null;
      case 'tipoAfiliacion':
      case 'claseRiesgo':
        return !valor ? 'Debe seleccionar una opción' : null;
      case 'fechaAfiliacionEPS':
      case 'fechaAfiliacionPensiones':
      case 'fechaAfiliacionCesantias':
      case 'fechaAfiliacionARL':
      case 'fechaAfiliacionCaja':
        return validarFechaAfiliacionCampo(valor, empleadoRelacionado);
      case 'estadoAfiliacionUi':
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
        esEdicion ? ['documento', 'nombre', 'estadoAfiliacionUi'] : ['documento', 'nombre'],
        ['eps', 'tipoAfiliacion', 'fechaAfiliacionEPS'],
        ['fondoPensiones', 'fechaAfiliacionPensiones'],
        ['fondoCesantias', 'fechaAfiliacionCesantias'],
        ['arl', 'claseRiesgo', 'fechaAfiliacionARL'],
        ['cajaCompensacion', 'fechaAfiliacionCaja'],
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
      if (idx === 0 && !formulario.cod_empleado) {
        nuevosErrores.documento = nuevosErrores.documento || 'No hay empleado con ese documento.';
      }
      setCamposTocados((p) => ({ ...p, ...todosTocados }));
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    },
    [formulario, esEdicion, empleadoRelacionado],
  );

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const esFechaAfiliacion = CAMPOS_FECHA_AFILIACION.includes(name);
    const esDocumento = name === 'documento';

    let empDocumentoAct = null;
    if (esDocumento && !esEdicion) {
      empDocumentoAct = empleadoPorDocumento(empleados, value);
    }

    setFormulario((prev) => {
      const next = { ...prev, [name]: value };
      if (esDocumento && !esEdicion) {
        const emp = empDocumentoAct;
        if (emp) {
          next.nombre = nombreCompletoEmpleado(emp);
          next.cod_empleado = String(codigoEmpleadoDesde(emp) ?? '');
        } else {
          next.nombre = '';
          next.cod_empleado = '';
        }
      }
      return next;
    });

    if (esDocumento && !esEdicion) {
      setErrores((prev) => {
        const next = { ...prev };
        for (const fk of CAMPOS_FECHA_AFILIACION) {
          if (camposTocados[fk]) {
            next[fk] = validarFechaAfiliacionCampo(formulario[fk], empDocumentoAct);
          }
        }
        return next;
      });
    }

    if (camposTocados[name] || esFechaAfiliacion || esDocumento) {
      setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
      if (esFechaAfiliacion || esDocumento) {
        setCamposTocados((p) => ({ ...p, [name]: true }));
      }
    }
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setCamposTocados((prev) => ({ ...prev, [name]: true }));
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const calcularErroresAfiliacion = () => {
    const nuevosErrores = {};
    const todosTocados = {};
    const campos = [
      'documento',
      'nombre',
      ...(esEdicion ? ['estadoAfiliacionUi'] : []),
      'eps',
      'tipoAfiliacion',
      'fechaAfiliacionEPS',
      'fondoPensiones',
      'fechaAfiliacionPensiones',
      'fondoCesantias',
      'fechaAfiliacionCesantias',
      'arl',
      'claseRiesgo',
      'fechaAfiliacionARL',
      'cajaCompensacion',
      'fechaAfiliacionCaja',
    ];
    for (const campo of campos) {
      todosTocados[campo] = true;
      const err = validarCampo(campo, formulario[campo]);
      if (err) nuevosErrores[campo] = err;
    }
    if (!formulario.cod_empleado) {
      nuevosErrores.documento = nuevosErrores.documento || 'No hay empleado con ese documento.';
    }
    return { nuevosErrores, todosTocados };
  };

  const pasoPorErroresAfili = (errs) => {
    const grupos = [
      esEdicion ? ['documento', 'nombre', 'estadoAfiliacionUi'] : ['documento', 'nombre'],
      ['eps', 'tipoAfiliacion', 'fechaAfiliacionEPS'],
      ['fondoPensiones', 'fechaAfiliacionPensiones'],
      ['fondoCesantias', 'fechaAfiliacionCesantias'],
      ['arl', 'claseRiesgo', 'fechaAfiliacionARL'],
      ['cajaCompensacion', 'fechaAfiliacionCaja'],
    ];
    for (let i = 0; i < grupos.length; i++) {
      if (grupos[i].some((c) => errs[c])) return i;
    }
    return 6;
  };

  const aplicarValidacionAfili = () => {
    const { nuevosErrores, todosTocados } = calcularErroresAfiliacion();
    setCamposTocados(todosTocados);
    setErrores(nuevosErrores);
    return nuevosErrores;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevosErrores = aplicarValidacionAfili();
    if (Object.keys(nuevosErrores).length > 0) {
      setPasoActual(pasoPorErroresAfili(nuevosErrores));
      return;
    }

    const payload = construirPayloadAfiliacion(formulario, catalogos);
    setEnviando(true);
    try {
      if (esEdicion && codEdicion != null) {
        await updateAfiliacion(codEdicion, payload);
        await alExito?.('actualizado');
      } else {
        await createAfiliacion(payload);
        await alExito?.('creado');
      }
      cerrar();
    } catch (err) {
      void alertaError('No se pudo guardar la afiliación', mensajeErrorApi(err));
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
          hint: 'Ingrese el documento de identidad del empleado.',
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
        {
          nombre: 'codigoAfiliacion',
          etiqueta: 'Código de Afiliación (referencia)',
          tipo: 'text',
          requerido: false,
          deshabilitado: true,
          hint: 'Referencia visible en pantalla; el identificador interno del sistema es numérico.',
        },
        ...(esEdicion
          ? [
              {
                nombre: 'estadoAfiliacionUi',
                etiqueta: 'Estado de la afiliación',
                tipo: 'select',
                requerido: true,
                selectSinVacio: true,
                opciones: opcionesEstadoAfiliacion,
                hint: 'Aprobada, pendiente o retirada. Se guarda al actualizar la afiliación.',
              },
            ]
          : []),
      ],
    },
    {
      numero: 2,
      titulo: 'Entidad Promotora de Salud EPS',
      color: 'azul',
      campos: [
        { nombre: 'eps', etiqueta: 'EPS', tipo: 'select', requerido: true, placeholder: 'Seleccione...', opciones: opcionesEPS },
        {
          nombre: 'tipoAfiliacion',
          etiqueta: 'Tipo de Afiliación',
          tipo: 'select',
          requerido: true,
          opciones: opcionesTipoAfiliacion,
        },
        {
          nombre: 'fechaAfiliacionEPS',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
      ],
    },
    {
      numero: 3,
      titulo: 'Fondo de Pensiones',
      color: 'verde',
      campos: [
        {
          nombre: 'fondoPensiones',
          etiqueta: 'Fondo de Pensiones',
          tipo: 'select',
          requerido: true,
          placeholder: 'Seleccione...',
          opciones: opcionesPensiones,
        },
        {
          nombre: 'fechaAfiliacionPensiones',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
      ],
    },
    {
      numero: 4,
      titulo: 'Fondo Cesantías',
      color: 'rosa',
      campos: [
        {
          nombre: 'fondoCesantias',
          etiqueta: 'Fondo de Cesantías',
          tipo: 'select',
          requerido: true,
          placeholder: 'Seleccione...',
          opciones: opcionesCesantias,
        },
        {
          nombre: 'fechaAfiliacionCesantias',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
      ],
    },
    {
      numero: 5,
      titulo: 'Aseguradora de Riesgos Laborales (ARL)',
      color: 'rojo',
      campos: [
        { nombre: 'arl', etiqueta: 'ARL', tipo: 'select', requerido: true, placeholder: 'Seleccione...', opciones: opcionesARL },
        {
          nombre: 'claseRiesgo',
          etiqueta: 'Clase de Riesgo',
          tipo: 'select',
          requerido: true,
          placeholder: 'Seleccione...',
          opciones: opcionesRiesgo,
        },
        {
          nombre: 'fechaAfiliacionARL',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
      ],
    },
    {
      numero: 6,
      titulo: 'Caja de Compensación Familiar',
      color: 'amarillo',
      campos: [
        {
          nombre: 'cajaCompensacion',
          etiqueta: 'Caja de Compensación',
          tipo: 'select',
          requerido: true,
          placeholder: 'Seleccione...',
          opciones: opcionesCaja,
        },
        {
          nombre: 'fechaAfiliacionCaja',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
      ],
    },
  ];

  if (!catalogos) {
    return (
      <Modal mostrar={mostrar} cerrar={cerrar} titulo="Afiliación">
        <p>Cargando catálogos…</p>
      </Modal>
    );
  }

  const solicitarCierre = async () => {
    const ok = await confirmarCierreModal({
      mensaje: esEdicion
        ? '¿Desea cancelar? Se perderán los datos no guardados.'
        : '¿Desea cancelar la creación de la afiliación?',
    });
    if (ok) cerrar();
  };

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo={esEdicion ? 'Editar Afiliación' : 'Registrar Nueva Afiliación'}
      confirmarAlCerrar
      mensajeConfirmarCierre={
        esEdicion
          ? '¿Desea cancelar? Se perderán los datos no guardados.'
          : '¿Desea cancelar la creación de la afiliación?'
      }
    >
      <form onSubmit={manejarGuardar}>
        <FormularioPasos
          pasos={[
            { numero: 1, titulo: 'Identificación del Empleado', color: 'morado' },
            { numero: 2, titulo: 'Entidad Promotora de Salud EPS', color: 'azul' },
            { numero: 3, titulo: 'Fondo de Pensiones', color: 'verde' },
            { numero: 4, titulo: 'Fondo Cesantías', color: 'rosa' },
            { numero: 5, titulo: 'Aseguradora de Riesgos Laborales (ARL)', color: 'rojo' },
            { numero: 6, titulo: 'Caja de Compensación Familiar', color: 'amarillo' },
            { numero: 7, titulo: 'Observaciones y resumen', color: 'verde' },
          ]}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          onCancelar={solicitarCierre}
          enviando={enviando}
          validarAntesDeSiguiente={validarAntesDeSiguiente}
          textoGuardar={esEdicion ? 'Actualizar Afiliación' : 'Registrar Afiliación'}
        >
          {pasoActual < 6 ? (
            <FormularioSecciones
              ocultarEncabezadosSeccion
              secciones={[secciones[pasoActual]]}
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
          {pasoActual === 6 ? (
            <>
              <div className="seccion-descripcion">
                <div className="seccion-descripcion-header">
                  <h3 className="seccion-descripcion-titulo">Descripción y Notas</h3>
                </div>
                <p className="seccion-descripcion-instruccion">
                  Obligatoria al guardar (máx. 200 caracteres). Si la deja vacía, el sistema puede usar un texto
                  predeterminado.
                </p>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  placeholder="Observaciones (opcional en pantalla)…"
                  rows="4"
                  maxLength={200}
                />
              </div>

              <div className="seccion-informacion">
                <h4 className="seccion-informacion-titulo">Información Importante</h4>
                <ul className="seccion-informacion-lista">
                  <li>Verifique que todos los datos estén correctos antes de registrar.</li>
                  <li>Los campos marcados con * son obligatorios.</li>
                  <li>La clase de riesgo debe elegirse según el catálogo de riesgos laborales del sistema.</li>
                </ul>
              </div>
            </>
          ) : null}
        </FormularioPasos>
      </form>
    </Modal>
  );
}

export default ModalAfiliacion;
