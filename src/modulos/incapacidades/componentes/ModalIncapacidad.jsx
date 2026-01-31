import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
import { validarNumeroDocumento, validarNombres } from '../../../utils/validaciones';
import '../../../estilos/componentes/formulario-secciones.css';

function ModalIncapacidad({ mostrar, cerrar, datosIncapacidad = null, onGuardar }) {
    const esEdicion = !!datosIncapacidad;

    const [formulario, setFormulario] = useState({
        // Sección 1: Identificación del Empleado
        documento: '',
        nombre: '',
        codigoContrato: '',
        codigoAfiliacion: '',
        // Sección 2: Información de la Incapacidad
        tipoIncapacidad: '',
        fechaInicio: '',
        fechaFin: '',
        // Sección 3: Diagnóstico Médico
        diagnostico: '',
        codigoClasificacion: '',
        // Descripción
        descripcion: ''
    });

    const [errores, setErrores] = useState({});
    const [camposTocados, setCamposTocados] = useState({});

    // Calcular días automáticamente
    const calcularDias = () => {
        if (formulario.fechaInicio && formulario.fechaFin) {
            const inicio = new Date(formulario.fechaInicio);
            const fin = new Date(formulario.fechaFin);
            if (fin >= inicio) {
                const diffTime = Math.abs(fin - inicio);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
            }
        }
        return 0;
    };

    const diasCalculados = calcularDias();

    useEffect(() => {
        if (datosIncapacidad) {
            // Modo edición: cargar datos existentes
            setFormulario({
                documento: datosIncapacidad.documento || '',
                nombre: datosIncapacidad.nombre || datosIncapacidad.empleado || '',
                codigoContrato: datosIncapacidad.codigoContrato || '',
                codigoAfiliacion: datosIncapacidad.codigoAfiliacion || datosIncapacidad.codigo || '',
                tipoIncapacidad: datosIncapacidad.tipo || datosIncapacidad.tipoIncapacidad || '',
                fechaInicio: datosIncapacidad.fechaInicio || '',
                fechaFin: datosIncapacidad.fechaFin || '',
                diagnostico: datosIncapacidad.diagnostico || datosIncapacidad.descripcionDiagnostico || '',
                codigoClasificacion: datosIncapacidad.codigoClasificacion || datosIncapacidad.codigoEnfermedad || '',
                descripcion: datosIncapacidad.descripcion || datosIncapacidad.observaciones || ''
            });
        } else {
            // Modo nuevo: formulario vacío con código generado automáticamente
            const codigoAuto = Math.floor(1000000 + Math.random() * 9000000).toString();
            setFormulario({
                documento: '',
                nombre: '',
                codigoContrato: '',
                codigoAfiliacion: codigoAuto,
                tipoIncapacidad: '',
                fechaInicio: '',
                fechaFin: '',
                diagnostico: '',
                codigoClasificacion: '',
                descripcion: ''
            });
        }
        setErrores({});
        setCamposTocados({});
    }, [datosIncapacidad, mostrar]);

    const validarCampo = (nombre, valor) => {
        switch (nombre) {
            case 'documento':
                return validarNumeroDocumento(valor);
            case 'nombre':
                return validarNombres(valor);
            case 'codigoContrato':
                if (!valor.trim()) return 'El código de contrato es requerido';
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
        setFormulario((prev) => ({ ...prev, [name]: value }));

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
            if (campo !== 'descripcion' && campo !== 'codigoClasificacion') {
                todosTocados[campo] = true;
                const error = validarCampo(campo, formulario[campo]);
                if (error) nuevosErrores[campo] = error;
            }
        });

        setCamposTocados(todosTocados);
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const manejarGuardar = (e) => {
        e.preventDefault();
        if (validarFormulario()) {
            if (onGuardar) {
                onGuardar(formulario);
            } else {
                console.log('Guardar incapacidad:', formulario);
            }
            cerrar();
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

    // Opciones para los selects
    const opcionesTipoIncapacidad = [
        'Enfermedad General',
        'Accidente Laboral',
        'Licencia Maternidad',
        'Licencia Paternidad'
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
                    hint: 'Ingrese el documento de identidad del empleado.'
                },
                {
                    nombre: 'nombre',
                    etiqueta: 'Nombre Empleado',
                    tipo: 'text',
                    requerido: true,
                    placeholder: 'Nombre completo del empleado'
                },
                {
                    nombre: 'codigoContrato',
                    etiqueta: 'Código Contrato',
                    tipo: 'text',
                    requerido: true,
                    placeholder: 'Ej: 1128455781'
                },
                {
                    nombre: 'codigoAfiliacion',
                    etiqueta: 'Código de Afiliación',
                    tipo: 'text',
                    requerido: true,
                    deshabilitado: true,
                    hint: 'Código Generado Automáticamente.'
                }
            ]
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
                    opciones: opcionesTipoIncapacidad
                },
                {
                    nombre: 'fechaInicio',
                    etiqueta: 'Fecha de Inicio',
                    tipo: 'date',
                    requerido: true,
                    placeholder: 'dd/mm/aaaa'
                },
                {
                    nombre: 'fechaFin',
                    etiqueta: 'Fecha de Fin',
                    tipo: 'date',
                    requerido: true,
                    placeholder: 'dd/mm/aaaa'
                },
                {
                    nombre: 'diasCalculados',
                    etiqueta: 'Días Calculados',
                    tipo: 'readonly',
                    calculado: true,
                    valorPorDefecto: diasCalculados.toString(),
                    sufijo: 'días',
                    hint: 'Se calculan Automáticamente'
                }
            ]
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
                    filas: 4
                },
                {
                    nombre: 'codigoClasificacion',
                    etiqueta: 'Código clasificación Enfermedad',
                    tipo: 'text',
                    requerido: false,
                    placeholder: 'Ej: J00, S82'
                }
            ]
        }
    ];

    return (
        <Modal
            mostrar={mostrar}
            cerrar={cerrar}
            titulo={esEdicion ? 'Editar Incapacidad' : 'Registrar Nueva Incapacidad'}
        >
            <form onSubmit={manejarGuardar}>
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

                {/* Sección de Descripción y Notas */}
                <div className="seccion-descripcion">
                    <div className="seccion-descripcion-header">
                        <h3 className="seccion-descripcion-titulo">Descripción y Notas</h3>
                    </div>
                    <p className="seccion-descripcion-instruccion">
                        Información adicional que considere relevante.
                    </p>
                    <textarea
                        name="descripcion"
                        value={formulario.descripcion}
                        onChange={manejarCambio}
                        placeholder="Agregue alguna información adicional...."
                        rows="4"
                    />
                </div>

                {/* Sección de Información sobre Pagos de Incapacidades */}
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

                {/* Botones de acción */}
                <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-guardar">
                        {esEdicion ? 'Actualizar Incapacidad' : 'Registrar Incapacidad'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalIncapacidad;
