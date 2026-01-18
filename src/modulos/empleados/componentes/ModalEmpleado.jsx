import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { validarNumeroDocumento, validarNombres } from '../../../utils/validaciones';
import { expresionesRegulares } from '../../../utils/validaciones';

function ModalEmpleado({ mostrar, cerrar, datosEmpleado = null }) {
  const esEdicion = !!datosEmpleado;
  const [formulario, setFormulario] = useState({
    documento: datosEmpleado?.documento || '',
    numeroCuenta: datosEmpleado?.numeroCuenta || '',
    tipoCuenta: datosEmpleado?.tipoCuenta || '',
    banco: datosEmpleado?.banco || '',
    direccion: datosEmpleado?.direccion || '',
    nacionalidad: datosEmpleado?.nacionalidad || '',
    estadoCivil: datosEmpleado?.estadoCivil || '',
    profesion: datosEmpleado?.profesion || '',
    discapacidad: datosEmpleado?.discapacidad || '',
    rh: datosEmpleado?.rh || '',
    grupoSanguineo: datosEmpleado?.grupoSanguineo || '',
    fechaExpedicion: datosEmpleado?.fechaExpedicion || '',
    descripcion: datosEmpleado?.descripcion || '',
  });

  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  useEffect(() => {
    if (datosEmpleado) {
      setFormulario({
        documento: datosEmpleado.documento || '',
        numeroCuenta: datosEmpleado.numeroCuenta || '',
        tipoCuenta: datosEmpleado.tipoCuenta || '',
        banco: datosEmpleado.banco || '',
        direccion: datosEmpleado.direccion || '',
        nacionalidad: datosEmpleado.nacionalidad || '',
        estadoCivil: datosEmpleado.estadoCivil || '',
        profesion: datosEmpleado.profesion || '',
        discapacidad: datosEmpleado.discapacidad || '',
        rh: datosEmpleado.rh || '',
        grupoSanguineo: datosEmpleado.grupoSanguineo || '',
        fechaExpedicion: datosEmpleado.fechaExpedicion || '',
        descripcion: datosEmpleado.descripcion || '',
      });
      setErrores({});
      setCamposTocados({});
    } else {
      setFormulario({
        documento: '',
        numeroCuenta: '',
        tipoCuenta: '',
        banco: '',
        direccion: '',
        nacionalidad: '',
        estadoCivil: '',
        profesion: '',
        discapacidad: '',
        rh: '',
        grupoSanguineo: '',
        fechaExpedicion: '',
        descripcion: '',
      });
      setErrores({});
      setCamposTocados({});
    }
  }, [datosEmpleado, mostrar]);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'documento':
        return validarNumeroDocumento(valor);
      case 'numeroCuenta':
        if (!valor.trim()) return 'El número de cuenta es requerido';
        if (!expresionesRegulares.soloNumeros.test(valor)) return 'Solo se permiten números';
        return null;
      case 'tipoCuenta':
        return !valor ? 'Debes seleccionar un tipo de cuenta' : null;
      case 'banco':
        if (!valor.trim()) return 'El banco es requerido';
        if (!expresionesRegulares.soloNumeros.test(valor)) return 'Solo se permiten números';
        return null;
      case 'direccion':
        if (!valor.trim()) return 'La dirección es requerida';
        return null;
      case 'nacionalidad':
        if (!valor.trim()) return 'La nacionalidad es requerida';
        if (!expresionesRegulares.soloLetras.test(valor)) return 'Solo se permiten letras';
        return null;
      case 'estadoCivil':
        return !valor ? 'Debes seleccionar un estado civil' : null;
      case 'profesion':
        if (!valor.trim()) return 'La profesión es requerida';
        if (!expresionesRegulares.soloLetras.test(valor)) return 'Solo se permiten letras';
        return null;
      case 'discapacidad':
        if (!valor.trim()) return 'Este campo es requerido';
        return null;
      case 'rh':
        return !valor ? 'Debes seleccionar el RH' : null;
      case 'grupoSanguineo':
        return !valor ? 'Debes seleccionar el grupo sanguíneo' : null;
      case 'fechaExpedicion':
        if (!valor) return 'La fecha de expedición es requerida';
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
      console.log('Guardar empleado:', formulario);
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
      return <span className="mensaje-error">{errores[nombreCampo]}</span>;
    }
    if (formulario[nombreCampo]) {
      return <span className="mensaje-exito">✓ Correcto</span>;
    }
    return null;
  };

  const estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'];
  const tiposCuenta = ['Ahorros', 'Corriente'];
  const gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const tiposRH = ['Positivo', 'Negativo'];

  return (
    <Modal mostrar={mostrar} cerrar={cerrar} titulo={esEdicion ? "Editar Empleado" : "Registrar Nuevo Empleado"}>
      <form onSubmit={manejarGuardar}>
        <div className="formulario-grid-doble">
          <div className="columna-izquierda">
            <div className="campo-formulario">
              <label>Número de Documento*</label>
              <input
                type="text"
                name="documento"
                value={formulario.documento}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Ingrese el documento"
                className={obtenerClaseCampo('documento')}
              />
              {mostrarMensaje('documento')}
            </div>

            <div className="campo-formulario">
              <label>Número de Cuenta*</label>
              <input
                type="text"
                name="numeroCuenta"
                value={formulario.numeroCuenta}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Número de cuenta bancaria"
                className={obtenerClaseCampo('numeroCuenta')}
              />
              {mostrarMensaje('numeroCuenta')}
            </div>

            <div className="campo-formulario">
              <label>Dirección*</label>
              <input
                type="text"
                name="direccion"
                value={formulario.direccion}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Dirección de residencia"
                className={obtenerClaseCampo('direccion')}
              />
              {mostrarMensaje('direccion')}
            </div>

            <div className="campo-formulario">
              <label>Nacionalidad*</label>
              <input
                type="text"
                name="nacionalidad"
                value={formulario.nacionalidad}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="País de nacionalidad"
                className={obtenerClaseCampo('nacionalidad')}
              />
              {mostrarMensaje('nacionalidad')}
            </div>

            <div className="campo-formulario">
              <label>Estado Civil*</label>
              <select
                name="estadoCivil"
                value={formulario.estadoCivil}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo('estadoCivil')}
              >
                <option value="">Seleccione</option>
                {estadosCiviles.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {mostrarMensaje('estadoCivil')}
            </div>

            <div className="campo-formulario">
              <label>Profesión*</label>
              <input
                type="text"
                name="profesion"
                value={formulario.profesion}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Profesión u oficio"
                className={obtenerClaseCampo('profesion')}
              />
              {mostrarMensaje('profesion')}
            </div>

            <div className="campo-formulario">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambio}
                placeholder="Información adicional del empleado"
                rows="4"
              />
            </div>
          </div>

          <div className="columna-derecha">
            <div className="campo-formulario">
              <label>Tipo de Cuenta*</label>
              <select
                name="tipoCuenta"
                value={formulario.tipoCuenta}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo('tipoCuenta')}
              >
                <option value="">Seleccione</option>
                {tiposCuenta.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {mostrarMensaje('tipoCuenta')}
            </div>

            <div className="campo-formulario">
              <label>Banco*</label>
              <input
                type="text"
                name="banco"
                value={formulario.banco}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Código del banco"
                className={obtenerClaseCampo('banco')}
              />
              {mostrarMensaje('banco')}
            </div>

            <div className="campo-formulario">
              <label>Discapacidad*</label>
              <input
                type="text"
                name="discapacidad"
                value={formulario.discapacidad}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Ninguna"
                className={obtenerClaseCampo('discapacidad')}
              />
              {mostrarMensaje('discapacidad')}
            </div>

            <div className="campo-formulario">
              <label>RH*</label>
              <select
                name="rh"
                value={formulario.rh}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo('rh')}
              >
                <option value="">Seleccione</option>
                {tiposRH.map((rh) => (
                  <option key={rh} value={rh}>{rh}</option>
                ))}
              </select>
              {mostrarMensaje('rh')}
            </div>

            <div className="campo-formulario">
              <label>Grupo Sanguíneo*</label>
              <select
                name="grupoSanguineo"
                value={formulario.grupoSanguineo}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo('grupoSanguineo')}
              >
                <option value="">Seleccione</option>
                {gruposSanguineos.map((grupo) => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
              {mostrarMensaje('grupoSanguineo')}
            </div>

            <div className="campo-formulario">
              <label>Fecha de Expedición del Doc*</label>
              <input
                type="date"
                name="fechaExpedicion"
                value={formulario.fechaExpedicion}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo('fechaExpedicion')}
              />
              {mostrarMensaje('fechaExpedicion')}
            </div>
          </div>
        </div>

        <div className="modal-acciones">
          <button type="button" className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            {esEdicion ? 'Actualizar Empleado' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalEmpleado;

