import { useState } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { validarNombres, validarNumeroDocumento, validarCorreo, validarTelefono } from '../../../utils/validaciones';

function ModalUsuario({ mostrar, cerrar, datosUsuario = null }) {
    const esEdicion = !!datosUsuario;
    const [formulario, setFormulario] = useState({
        nombre: datosUsuario?.nombre || '',
        documento: datosUsuario?.documento || '',
        email: datosUsuario?.email || '',
        telefono: datosUsuario?.telefono || '',
        rol: datosUsuario?.rol || '',
    });

    const [errores, setErrores] = useState({});
    const [camposTocados, setCamposTocados] = useState({});

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

    const validarCampo = (nombre, valor) => {
        switch (nombre) {
            case 'nombre':
                return validarNombres(valor);
            case 'documento':
                return validarNumeroDocumento(valor);
            case 'email':
                return validarCorreo(valor);
            case 'telefono':
                return validarTelefono(valor);
            case 'rol':
                return !valor ? 'Debes seleccionar un rol' : null;
            default:
                return null;
        }
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
            console.log('Guardar usuario:', formulario);
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

    const roles = [
        { valor: 'Administrador', texto: 'Administrador - Acceso total al sistema' },
        { valor: 'Editor', texto: 'Editor - Puede crear y modificar' },
        { valor: 'Visualizador', texto: 'Visualizador - Solo lectura' },
    ];

    return (
        <Modal mostrar={mostrar} cerrar={cerrar} titulo={esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}>
            <form onSubmit={manejarGuardar}>
                <div className="formulario-seccion">
                    <h3>Información Personal</h3>
                    <div className="formulario-grid">
                        <div className="campo-formulario">
                            <label>Nombre Completo*</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Ingrese el nombre completo"
                                className={obtenerClaseCampo('nombre')}
                            />
                            {mostrarMensaje('nombre')}
                        </div>
                        <div className="campo-formulario">
                            <label>Documento*</label>
                            <input
                                type="text"
                                name="documento"
                                value={formulario.documento}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Número de documento"
                                className={obtenerClaseCampo('documento')}
                            />
                            {mostrarMensaje('documento')}
                        </div>
                        <div className="campo-formulario">
                            <label>Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={formulario.email}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="correo@ejemplo.com"
                                className={obtenerClaseCampo('email')}
                            />
                            {mostrarMensaje('email')}
                        </div>
                        <div className="campo-formulario">
                            <label>Teléfono*</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formulario.telefono}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="+57 300 123 4567"
                                className={obtenerClaseCampo('telefono')}
                            />
                            {mostrarMensaje('telefono')}
                        </div>
                    </div>
                </div>

                <div className="formulario-seccion">
                    <h3>Permisos y Acceso</h3>
                    <div className="roles-opciones">
                        {roles.map((rol) => (
                            <label key={rol.valor} className={`rol-opcion ${formulario.rol === rol.valor ? 'activo' : ''}`}>
                                <input
                                    type="radio"
                                    name="rol"
                                    value={rol.valor}
                                    checked={formulario.rol === rol.valor}
                                    onChange={manejarCambio}
                                    onBlur={manejarBlur}
                                />
                                <div className="rol-contenido">
                                    <span className="rol-titulo">{rol.valor}</span>
                                    <span className="rol-descripcion">{rol.texto.split(' - ')[1]}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    {camposTocados.rol && errores.rol && (
                        <span className="mensaje-error">{errores.rol}</span>
                    )}
                    {camposTocados.rol && !errores.rol && formulario.rol && (
                        <span className="mensaje-exito">✓ Correcto</span>
                    )}
                </div>

                <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-guardar">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalUsuario;

