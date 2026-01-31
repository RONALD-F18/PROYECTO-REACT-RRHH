import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
import { validarNumeroDocumento, validarNombres } from '../../../utils/validaciones';
import '../../../estilos/componentes/formulario-secciones.css';

function ModalAfiliacion({ mostrar, cerrar, datosAfiliacion = null, onGuardar }) {
  const esEdicion = !!datosAfiliacion;
  
  const [formulario, setFormulario] = useState({
    // Sección 1: Identificación del Empleado
    documento: '',
    nombre: '',
    codigoAfiliacion: '',
    // Sección 2: EPS
    eps: '',
    tipoAfiliacion: '',
    fechaAfiliacionEPS: '',
    // Sección 3: Fondo de Pensiones
    fondoPensiones: '',
    fechaAfiliacionPensiones: '',
    // Sección 4: Fondo Cesantías
    fondoCesantias: '',
    fechaAfiliacionCesantias: '',
    // Sección 5: ARL
    arl: '',
    claseRiesgo: '',
    fechaAfiliacionARL: '',
    // Sección 6: Caja de Compensación
    cajaCompensacion: '',
    fechaAfiliacionCaja: '',
    // Descripción
    descripcion: ''
  });

  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  useEffect(() => {
    if (datosAfiliacion) {
      // Modo edición: cargar datos existentes
      setFormulario({
        documento: datosAfiliacion.documento || '',
        nombre: datosAfiliacion.nombre || '',
        codigoAfiliacion: datosAfiliacion.codigoAfiliacion || '',
        eps: datosAfiliacion.eps || '',
        tipoAfiliacion: datosAfiliacion.tipoAfiliacion || '',
        fechaAfiliacionEPS: datosAfiliacion.fechaAfiliacionEPS || '',
        fondoPensiones: datosAfiliacion.fondoPensiones || '',
        fechaAfiliacionPensiones: datosAfiliacion.fechaAfiliacionPensiones || '',
        fondoCesantias: datosAfiliacion.fondoCesantias || '',
        fechaAfiliacionCesantias: datosAfiliacion.fechaAfiliacionCesantias || '',
        arl: datosAfiliacion.arl || '',
        claseRiesgo: datosAfiliacion.claseRiesgo || '',
        fechaAfiliacionARL: datosAfiliacion.fechaAfiliacionARL || '',
        cajaCompensacion: datosAfiliacion.cajaCompensacion || '',
        fechaAfiliacionCaja: datosAfiliacion.fechaAfiliacionCaja || '',
        descripcion: datosAfiliacion.descripcion || ''
      });
    } else {
      // Modo nuevo: formulario vacío con código generado automáticamente
      const codigoAuto = `AF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
      setFormulario({
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
        descripcion: ''
      });
    }
    setErrores({});
    setCamposTocados({});
  }, [datosAfiliacion, mostrar]);

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
        if (!valor) return 'La fecha de afiliación es requerida';
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
      if (campo !== 'descripcion') {
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
        console.log('Guardar afiliación:', formulario);
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
  const opcionesEPS = ['SURA', 'Nueva EPS', 'Sanitas', 'Coomeva', 'Salud Total'];
  const opcionesTipoAfiliacion = ['Contributivo', 'Subsidiado'];
  const opcionesFondos = ['Protección', 'Porvenir', 'Colfondos', 'Skandia', 'Old Mutual'];
  const opcionesARL = ['SURA', 'Positiva', 'Colpatria', 'La Equidad'];
  const opcionesClaseRiesgo = [
    '1 - Riesgo Mínimo',
    '2 - Riesgo Bajo',
    '3 - Riesgo Medio',
    '4 - Riesgo Alto',
    '5 - Riesgo Máximo'
  ];
  const opcionesCaja = ['Compensar', 'Cafam', 'Colsubsidio', 'Comfandi', 'Comfenalco'];

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
      titulo: 'Entidad Promotora de Salud EPS',
      color: 'azul',
      campos: [
        {
          nombre: 'eps',
          etiqueta: 'EPS',
          tipo: 'select',
          requerido: true,
          opciones: opcionesEPS
        },
        {
          nombre: 'tipoAfiliacion',
          etiqueta: 'Tipo de Afiliación',
          tipo: 'select',
          requerido: true,
          opciones: opcionesTipoAfiliacion
        },
        {
          nombre: 'fechaAfiliacionEPS',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa'
        }
      ]
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
          opciones: opcionesFondos
        },
        {
          nombre: 'fechaAfiliacionPensiones',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa'
        }
      ]
    },
    {
      numero: 4,
      titulo: 'Fondo Cesantías',
      color: 'rosa',
      campos: [
        {
          nombre: 'fondoCesantias',
          etiqueta: 'Fondo de Pensiones',
          tipo: 'select',
          requerido: true,
          opciones: opcionesFondos
        },
        {
          nombre: 'fechaAfiliacionCesantias',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa'
        }
      ]
    },
    {
      numero: 5,
      titulo: 'Aseguradora de Riesgos Laborales (ARL)',
      color: 'rojo',
      campos: [
        {
          nombre: 'arl',
          etiqueta: 'ARL',
          tipo: 'select',
          requerido: true,
          opciones: opcionesARL
        },
        {
          nombre: 'claseRiesgo',
          etiqueta: 'Clase de Riesgo',
          tipo: 'select',
          requerido: true,
          opciones: opcionesClaseRiesgo
        },
        {
          nombre: 'fechaAfiliacionARL',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa'
        }
      ]
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
          opciones: opcionesCaja
        },
        {
          nombre: 'fechaAfiliacionCaja',
          etiqueta: 'Fecha de Afiliación',
          tipo: 'date',
          requerido: true,
          placeholder: 'dd/mm/aaaa'
        }
      ]
    }
  ];

  return (
    <Modal 
      mostrar={mostrar} 
      cerrar={cerrar} 
      titulo={esEdicion ? 'Editar Afiliación' : 'Registrar Nueva Afiliación'}
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
            placeholder="Agregue observaciones o detalles adicionales sobre la afiliación (opcional)..."
            rows="4"
          />
        </div>

        {/* Sección de Información Importante */}
        <div className="seccion-informacion">
          <h4 className="seccion-informacion-titulo">Información Importante</h4>
          <ul className="seccion-informacion-lista">
            <li>Verifique que todos los datos estén correctos antes de registrar.</li>
            <li>La solicitud será procesada por la EPS correspondiente.</li>
            <li>Los campos marcados con * son obligatorios.</li>
            <li>El proceso de afiliación puede tardar de 3 a 5 días hábiles.</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="modal-acciones">
          <button type="button" className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            {esEdicion ? 'Actualizar Afiliación' : 'Registrar Afiliación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalAfiliacion;

