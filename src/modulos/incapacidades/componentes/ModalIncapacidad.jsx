import { useState, useEffect, useMemo } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
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
import '../../../estilos/componentes/formulario-secciones.css';

const DESCRIPCION_MAX = 200;

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
      error: `Diagnóstico y notas no pueden superar ${DESCRIPCION_MAX} caracteres en total (límite de la API).`,
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

  return payload;
}

function ModalIncapacidad({ mostrar, cerrar, datosIncapacidad = null, empleados = [], alExito }) {
  const esEdicion = !!datosIncapacidad && codigoIncapacidadDesde(datosIncapacidad) != null;

  const [formulario, setFormulario] = useState(() => estadoFormularioVacio());
  const [tiposCatalogo, setTiposCatalogo] = useState([]);
  const [clasifCatalogo, setClasifCatalogo] = useState([]);
  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

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
        const [t, c] = await Promise.all([getTiposIncapacidad(), getClasificacionesEnfermedad()]);
        if (cancel) return;
        setTiposCatalogo(extraerFilasCatalogo(t));
        setClasifCatalogo(extraerFilasCatalogo(c));
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

  const opcionesClasif = useMemo(
    () =>
      clasifCatalogo.map((c) => {
        const cod = c.codigo_cie10 != null ? String(c.codigo_cie10).trim() : '';
        const nom = c.nombre_clasificacion != null ? String(c.nombre_clasificacion).trim() : '';
        const texto = [cod, nom].filter(Boolean).join(' — ') || String(c.cod_clasificacion_enfermedad);
        return { valor: String(c.cod_clasificacion_enfermedad), texto };
      }),
    [clasifCatalogo],
  );

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'documento':
        return validarNumeroDocumento(valor);
      case 'nombre':
        return validarNombres(valor);
      case 'tipoIncapacidad':
        return !valor ? 'Debe seleccionar un tipo de incapacidad' : null;
      case 'fechaInicio':
        if (!valor) return 'La fecha de inicio es requerida';
        return null;
      case 'fechaFin':
        if (!valor) return 'La fecha de fin es requerida';
        if (formulario.fechaInicio && valor < formulario.fechaInicio) {
          return 'La fecha de fin debe ser igual o posterior a la fecha de inicio';
        }
        return null;
      case 'diagnostico': {
        const comb = combinarDescripcionParaApi(valor, formulario.descripcion);
        if (!comb.ok) return comb.error;
        if (!String(valor ?? '').trim()) return 'El diagnóstico es requerido';
        return null;
      }
      default:
        return null;
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'documento' && !esEdicion) {
        const emp = buscarEmpleadoPorDocumento(empleados, value);
        if (emp) next.nombre = nombreCompletoEmpleado(emp);
      }
      return next;
    });

    if (camposTocados[name]) {
      const error = validarCampo(name, value);
      setErrores((prev) => ({ ...prev, [name]: error }));
    }
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setCamposTocados((prev) => ({ ...prev, [name]: true }));
    const error = validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const todosTocados = {};
    const campos = [
      'documento',
      'nombre',
      'tipoIncapacidad',
      'fechaInicio',
      'fechaFin',
      'diagnostico',
    ];
    for (const campo of campos) {
      todosTocados[campo] = true;
      const error = validarCampo(campo, formulario[campo]);
      if (error) nuevosErrores[campo] = error;
    }
    const comb = combinarDescripcionParaApi(formulario.diagnostico, formulario.descripcion);
    if (!comb.ok) nuevosErrores.diagnostico = comb.error;

    setCamposTocados((prev) => ({ ...prev, ...todosTocados }));
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    if (!validarFormulario()) return;

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
          hint: 'Ingrese el documento de identidad del empleado. Se usará para enviar cod_empleado al API.',
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
        },
        {
          nombre: 'fechaFin',
          etiqueta: 'Fecha de Fin',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa',
        },
        {
          nombre: 'fechaRadicacion',
          etiqueta: 'Fecha de radicación',
          tipo: 'date',
          requerido: false,
          placeholder: 'Opcional',
          hint: 'Si no se envía, el servidor puede asignar la fecha actual.',
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
          hint: `Se envía como descripcion en la API (máx. ${DESCRIPCION_MAX} caracteres junto con notas).`,
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

        <FormularioSecciones
          secciones={secciones}
          valores={formulario}
          errores={errores}
          camposTocados={camposTocados}
          onChange={manejarCambio}
          onBlur={manejarBlur}
          obtenerClaseCampo={obtenerClaseCampo}
          mostrarMensaje={mostrarMensaje}
        />

        <div className="seccion-descripcion">
          <div className="seccion-descripcion-header">
            <h3 className="seccion-descripcion-titulo">Descripción y Notas</h3>
          </div>
          <p className="seccion-descripcion-instruccion">
            Información adicional; se concatena con el diagnóstico en un solo campo descripcion (máx. {DESCRIPCION_MAX}{' '}
            caracteres en total).
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

        <div className="modal-acciones">
          <button type="button" className="btn-cancelar" onClick={cerrar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar" disabled={enviando}>
            {enviando ? 'Guardando…' : esEdicion ? 'Actualizar Incapacidad' : 'Registrar Incapacidad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalIncapacidad;
