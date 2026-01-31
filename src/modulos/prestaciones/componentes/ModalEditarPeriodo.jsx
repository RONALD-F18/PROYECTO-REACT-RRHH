import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioSecciones from '../../../componentes/comunes/FormularioSecciones';
import '../../../estilos/componentes/formulario-secciones.css';

function ModalEditarPeriodo({ mostrar, cerrar, datosPeriodo = null, onGuardar }) {
  const esEdicion = !!datosPeriodo;
  
  const [formulario, setFormulario] = useState({
    fechaInicio: '',
    fechaFin: '',
    dias: 0,
    cesantias: '',
    intereses: '',
    prima: '',
    vacaciones: '',
    estado: ''
  });

  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  // Calcular días automáticamente
  const calcularDias = (fechaInicio, fechaFin) => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin >= inicio) {
        const diffTime = Math.abs(fin - inicio);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 0;
  };

  // Calcular días basado en las fechas actuales del formulario
  const diasCalculados = formulario.fechaInicio && formulario.fechaFin 
    ? calcularDias(formulario.fechaInicio, formulario.fechaFin) 
    : (formulario.dias || 0);

  useEffect(() => {
    if (datosPeriodo) {
      // Parsear el período (formato: "02/02/2025 al 04/11/2025")
      const partesPeriodo = datosPeriodo.periodo ? datosPeriodo.periodo.split(' al ') : [];
      const fechaInicioStr = partesPeriodo[0] || '';
      const fechaFinStr = partesPeriodo[1] || '';
      
      // Convertir formato DD/MM/YYYY a YYYY-MM-DD para inputs date
      const convertirFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const partes = fechaStr.split('/');
        if (partes.length === 3) {
          return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return '';
      };

      // Limpiar valores monetarios (remover $ y puntos)
      const limpiarValor = (valor) => {
        if (!valor) return '';
        return valor.toString().replace(/[$.]/g, '').trim();
      };

      setFormulario({
        fechaInicio: convertirFecha(fechaInicioStr),
        fechaFin: convertirFecha(fechaFinStr),
        dias: datosPeriodo.dias || 0,
        cesantias: limpiarValor(datosPeriodo.cesantias),
        intereses: limpiarValor(datosPeriodo.intereses),
        prima: limpiarValor(datosPeriodo.prima),
        vacaciones: limpiarValor(datosPeriodo.vacaciones),
        estado: datosPeriodo.estado || ''
      });
    } else {
      setFormulario({
        fechaInicio: '',
        fechaFin: '',
        dias: 0,
        cesantias: '',
        intereses: '',
        prima: '',
        vacaciones: '',
        estado: ''
      });
    }
    setErrores({});
    setCamposTocados({});
  }, [datosPeriodo, mostrar]);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'fechaInicio':
        if (!valor) return 'La fecha de inicio es requerida';
        return null;
      case 'fechaFin':
        if (!valor) return 'La fecha de fin es requerida';
        if (formulario.fechaInicio && valor < formulario.fechaInicio) {
          return 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        return null;
      case 'cesantias':
      case 'intereses':
      case 'prima':
      case 'vacaciones':
        if (!valor.trim()) return 'Este campo es requerido';
        if (isNaN(valor.replace(/[.,]/g, ''))) return 'Debe ser un valor numérico válido';
        return null;
      case 'estado':
        return !valor ? 'Debe seleccionar un estado' : null;
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

  const formatearValor = (valor) => {
    if (!valor) return '';
    const numero = valor.toString().replace(/[.,]/g, '');
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numero);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const todosTocados = {};

    Object.keys(formulario).forEach((campo) => {
      todosTocados[campo] = true;
      const error = validarCampo(campo, formulario[campo]);
      if (error) nuevosErrores[campo] = error;
    });

    setCamposTocados(todosTocados);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      // Formatear valores antes de guardar
      const datosGuardar = {
        ...formulario,
        dias: diasCalculados,
        cesantias: formatearValor(formulario.cesantias),
        intereses: formatearValor(formulario.intereses),
        prima: formatearValor(formulario.prima),
        vacaciones: formatearValor(formulario.vacaciones),
        periodo: `${formatearFecha(formulario.fechaInicio)} al ${formatearFecha(formulario.fechaFin)}`
      };
      
      if (onGuardar) {
        onGuardar(datosGuardar);
      } else {
        console.log('Guardar período:', datosGuardar);
      }
      cerrar();
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
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

  const opcionesEstado = ['Pendiente', 'Pagado', 'Cancelado', 'En Proceso'];

  const secciones = [
    {
      numero: 1,
      titulo: 'Periodo de Cálculo',
      color: 'azul',
      campos: [
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
          valorPorDefecto: diasCalculados > 0 ? diasCalculados.toString() : (formulario.dias || 0).toString(),
          sufijo: 'días',
          hint: 'Se calculan Automáticamente'
        }
      ]
    },
    {
      numero: 2,
      titulo: 'Valores de Prestaciones',
      color: 'verde',
      campos: [
        {
          nombre: 'cesantias',
          etiqueta: 'Cesantías',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej: 1789243'
        },
        {
          nombre: 'intereses',
          etiqueta: 'Intereses sobre Cesantías',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej: 578947'
        },
        {
          nombre: 'prima',
          etiqueta: 'Prima de Servicios',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej: 3578947'
        },
        {
          nombre: 'vacaciones',
          etiqueta: 'Vacaciones',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej: 2578947'
        }
      ]
    },
    {
      numero: 3,
      titulo: 'Estado del Período',
      color: 'morado',
      campos: [
        {
          nombre: 'estado',
          etiqueta: 'Estado',
          tipo: 'select',
          requerido: true,
          opciones: opcionesEstado
        }
      ]
    }
  ];

  return (
    <Modal 
      mostrar={mostrar} 
      cerrar={cerrar} 
      titulo={esEdicion ? 'Editar Período de Cálculo' : 'Nuevo Período de Cálculo'}
    >
      <form onSubmit={manejarGuardar}>
        <FormularioSecciones
          secciones={secciones.map(seccion => ({
            ...seccion,
            campos: seccion.campos.map(campo => 
              campo.nombre === 'diasCalculados' 
                ? { ...campo, valorPorDefecto: diasCalculados.toString() }
                : campo
            )
          }))}
          valores={formulario}
          errores={errores}
          camposTocados={camposTocados}
          onChange={manejarCambio}
          onBlur={manejarBlur}
          obtenerClaseCampo={obtenerClaseCampo}
          mostrarMensaje={mostrarMensaje}
        />

        {/* Sección de Información Importante */}
        <div className="seccion-informacion">
          <h4 className="seccion-informacion-titulo">Información Importante</h4>
          <ul className="seccion-informacion-lista">
            <li>Los días se calculan automáticamente según las fechas seleccionadas.</li>
            <li>Los valores deben ingresarse sin puntos ni símbolos de moneda.</li>
            <li>Verifique que todos los valores estén correctos antes de guardar.</li>
            <li>El período de cálculo debe corresponder a un ciclo completo de prestaciones.</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="modal-acciones">
          <button type="button" className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            {esEdicion ? 'Actualizar Período' : 'Guardar Período'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalEditarPeriodo;

