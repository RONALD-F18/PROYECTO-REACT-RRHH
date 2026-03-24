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
} from '../../../services/incapacidades';
import { codigoEmpleadoDesde, nombreCompletoEmpleado, empleadoPorDocumento } from '../../../services/empleados';
import '../../../estilos/componentes/formulario-secciones.css';

function estadoFormularioVacio(codigoAuto) {
  return {
    documento: '',
    nombre: '',
    codigoContrato: '',
    codigoAfiliacion: codigoAuto,
    tipoIncapacidad: '',
    fechaInicio: '',
    fechaFin: '',
    diagnostico: '',
    codigoClasificacion: '',
    descripcion: '',
  };
}

function incapacidadApiAFormulario(raw, empleados) {
  const r = normalizarRegistroIncapacidad(raw) ?? raw;
  if (!r || typeof r !== 'object') return estadoFormularioVacio('');
  let emp =
    r.empleado && typeof r.empleado === 'object' && !Array.isArray(r.empleado) ? r.empleado : null;
  if (!emp && r.cod_empleado != null && Array.isArray(empleados)) {
    emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(r.cod_empleado)) ?? null;
  }
  return {
    documento: emp ? String(emp.doc_iden ?? '').trim() : '',
    nombre: emp ? nombreCompletoEmpleado(emp) : '',
    codigoContrato: r.cod_contrato != null ? String(r.cod_contrato) : '',
    codigoAfiliacion:
      r.cod_afiliacion != null
        ? String(r.cod_afiliacion)
        : r.cod_incapacidad != null
          ? String(r.cod_incapacidad)
          : '',
    tipoIncapacidad: r.tipo_incapacidad ? String(r.tipo_incapacidad) : '',
    fechaInicio: r.fecha_inicio ? String(r.fecha_inicio).slice(0, 10) : '',
    fechaFin: r.fecha_fin ? String(r.fecha_fin).slice(0, 10) : '',
    diagnostico: r.diagnostico != null ? String(r.diagnostico) : '',
    codigoClasificacion:
      r.codigo_enfermedad != null
        ? String(r.codigo_enfermedad)
        : r.codigo_cie != null
          ? String(r.codigo_cie)
          : '',
    descripcion:
      r.observaciones != null
        ? String(r.observaciones)
        : r.descripcion != null
          ? String(r.descripcion)
          : '',
  };
}

function construirPayloadIncapacidad(formulario, codEmpleado) {
  const cod = Number(codEmpleado);
  const payload = {
    cod_empleado: cod,
    tipo_incapacidad: formulario.tipoIncapacidad.trim(),
    fecha_inicio: formulario.fechaInicio,
    fecha_fin: formulario.fechaFin,
    diagnostico: formulario.diagnostico.trim(),
    codigo_enfermedad: formulario.codigoClasificacion?.trim() || null,
    observaciones: formulario.descripcion?.trim() || '',
    estado_incapacidad: 'ACTIVA',
  };
  const cc = formulario.codigoContrato?.trim();
  if (cc) {
    const n = Number(cc);
    payload.cod_contrato = Number.isFinite(n) ? n : cc;
  }
  return payload;
}

function ModalIncapacidad({ mostrar, cerrar, datosIncapacidad = null, empleados = [], alExito }) {
  const esEdicion = !!datosIncapacidad && codigoIncapacidadDesde(datosIncapacidad) != null;

  const [formulario, setFormulario] = useState(() => estadoFormularioVacio(''));
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
    setErrorGeneral('');
    if (datosIncapacidad && codigoIncapacidadDesde(datosIncapacidad) != null) {
      setFormulario(incapacidadApiAFormulario(datosIncapacidad, empleados));
    } else {
      const codigoAuto = Math.floor(1000000 + Math.random() * 9000000).toString();
      setFormulario(estadoFormularioVacio(codigoAuto));
    }
    setErrores({});
    setCamposTocados({});
  }, [datosIncapacidad, mostrar, empleados]);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'documento':
        return validarNumeroDocumento(valor);
      case 'nombre':
        return validarNombres(valor);
      case 'codigoContrato':
        return null;
      case 'tipoIncapacidad':
        return !valor ? 'Debe seleccionar un tipo de incapacidad' : null;
      case 'fechaInicio':
        if (!valor) return 'La fecha de inicio es requerida';
        return null;
      case 'fechaFin':
        if (!valor) return 'La fecha de fin es requerida';
        if (formulario.fechaInicio && valor < formulario.fechaInicio) {
          return 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        return null;
      case 'diagnostico':
        if (!valor.trim()) return 'El diagnóstico es requerido';
        return null;
      default:
        return null;
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'documento' && !esEdicion) {
        const emp = empleadoPorDocumento(empleados, value);
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

    Object.keys(formulario).forEach((campo) => {
      if (campo !== 'descripcion' && campo !== 'codigoClasificacion' && campo !== 'codigoAfiliacion') {
        todosTocados[campo] = true;
        const error = validarCampo(campo, formulario[campo]);
        if (error) nuevosErrores[campo] = error;
      }
    });

    setCamposTocados(todosTocados);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    if (!validarFormulario()) return;

    const emp = empleadoPorDocumento(empleados, formulario.documento);
    const codEmp = emp ? codigoEmpleadoDesde(emp) : null;
    if (codEmp == null) {
      setErrorGeneral('No se encontró un empleado con ese documento. Verifique el número o sincronice empleados.');
      return;
    }

    const payload = construirPayloadIncapacidad(formulario, codEmp);
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

  const opcionesTipoIncapacidad = [
    'Enfermedad General',
    'Accidente Laboral',
    'Licencia Maternidad',
    'Licencia Paternidad',
  ];

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
          nombre: 'codigoContrato',
          etiqueta: 'Código Contrato',
          tipo: 'text',
          requerido: false,
          placeholder: 'Opcional — referencia interna',
        },
        {
          nombre: 'codigoAfiliacion',
          etiqueta: 'Referencia / código interno',
          tipo: 'text',
          requerido: false,
          deshabilitado: esEdicion,
          hint: esEdicion ? 'Identificador del registro.' : 'Opcional: código de afiliación si aplica.',
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
          opciones: opcionesTipoIncapacidad,
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
          nombre: 'diasCalculados',
          etiqueta: 'Días Calculados',
          tipo: 'readonly',
          calculado: true,
          valorPorDefecto: diasCalculados.toString(),
          sufijo: 'días',
          hint: 'Se calculan Automáticamente',
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
        },
        {
          nombre: 'codigoClasificacion',
          etiqueta: 'Código clasificación Enfermedad',
          tipo: 'text',
          requerido: false,
          placeholder: 'Ej: J00, S82',
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
          <p className="seccion-descripcion-instruccion">Información adicional que considere relevante.</p>
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
