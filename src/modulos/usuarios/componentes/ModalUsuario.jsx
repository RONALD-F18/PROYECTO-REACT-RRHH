import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import * as validaciones from '../../../utils/validaciones';

function ModalUsuario({ mostrar, cerrar, datosUsuario = null }) {
    const esEdicion = !!datosUsuario;
    
    const [formulario, setFormulario] = useState({
        nombres: '',
        apellidos: '',
        nombreUsuario: '',
        tipoDocumento: '',
        numeroDocumento: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        telefono: '',
        fechaNacimiento: '',
        rol: '',
        estado: 'Activo',
    });

    const [errores, setErrores] = useState({});
    const [camposTocados, setCamposTocados] = useState({});

    useEffect(() => {
        if (datosUsuario) {
            // Pre-llenar formulario con datos del usuario para edición
            setFormulario({
                nombres: datosUsuario.nombres || datosUsuario.nombre?.split(' ')[0] || '',
                apellidos: datosUsuario.apellidos || datosUsuario.nombre?.split(' ').slice(1).join(' ') || '',
                nombreUsuario: datosUsuario.nombreUsuario || '',
                tipoDocumento: datosUsuario.tipoDocumento || '',
                numeroDocumento: datosUsuario.numeroDocumento || datosUsuario.documento || '',
                correo: datosUsuario.correo || datosUsuario.email || '',
                contrasena: '',
                confirmarContrasena: '',
                telefono: datosUsuario.telefono || '',
                fechaNacimiento: datosUsuario.fechaNacimiento || '',
                rol: datosUsuario.rol || '',
                estado: datosUsuario.estado || 'Activo',
            });
        } else {
            // Limpiar formulario para nuevo usuario
            setFormulario({
                nombres: '',
                apellidos: '',
                nombreUsuario: '',
                tipoDocumento: '',
                numeroDocumento: '',
                correo: '',
                contrasena: '',
                confirmarContrasena: '',
                telefono: '',
                fechaNacimiento: '',
                rol: '',
                estado: 'Activo',
            });
        }
        setErrores({});
        setCamposTocados({});
    }, [datosUsuario, mostrar]);

    const validadores = {
        nombres: validaciones.validarNombres,
        apellidos: validaciones.validarApellidos,
        nombreUsuario: validaciones.validarNombreUsuario,
        tipoDocumento: validaciones.validarTipoDocumento,
        numeroDocumento: validaciones.validarNumeroDocumento,
        correo: validaciones.validarCorreo,
        contrasena: esEdicion ? (valor) => valor ? validaciones.validarContrasena(valor) : null : validaciones.validarContrasena,
        confirmarContrasena: (valor) => validaciones.validarConfirmarContrasena(valor, formulario.contrasena),
        telefono: validaciones.validarTelefono,
        fechaNacimiento: validaciones.validarFechaNacimiento,
        rol: (valor) => !valor ? 'Debes seleccionar un rol' : null,
        estado: (valor) => !valor ? 'Debes seleccionar un estado' : null,
    };

    const validarCampo = (nombre, valor) => {
        const validador = validadores[nombre];
        return validador ? validador(valor) : null;
    };

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;
        const valorFinal = type === 'checkbox' ? checked : value;

        setFormulario((prev) => ({
            ...prev,
            [name]: valorFinal,
        }));

        if (camposTocados[name]) {
            const error = validarCampo(name, valorFinal);
            setErrores((prev) => ({ ...prev, [name]: error }));
        }

        if (name === 'contrasena' && camposTocados.confirmarContrasena) {
            const errorConfirmar = validarCampo('confirmarContrasena', formulario.confirmarContrasena);
            setErrores((prev) => ({ ...prev, confirmarContrasena: errorConfirmar }));
        }
    };

    const manejarBlur = (e) => {
        const { name, value, type, checked } = e.target;
        const valorFinal = type === 'checkbox' ? checked : value;

        setCamposTocados((prev) => ({ ...prev, [name]: true }));
        const error = validarCampo(name, valorFinal);
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

        // En edición, la contraseña es opcional
        if (esEdicion && !formulario.contrasena) {
            delete nuevosErrores.contrasena;
            delete nuevosErrores.confirmarContrasena;
        }

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

    const tiposDocumento = [
        { valor: 'CC', texto: 'Cédula de Ciudadanía' },
        { valor: 'CE', texto: 'Cédula de Extranjería' },
        { valor: 'TI', texto: 'Tarjeta de Identidad' },
    ];

    const roles = [
        { valor: 'Visualizador', texto: 'Solo lectura' },
        { valor: 'Administrador', texto: 'Acceso total al sistema' },
        { valor: 'Funcionario', texto: 'Puede crear y modificar' },
    ];

    return (
        <Modal mostrar={mostrar} cerrar={cerrar} titulo={esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}>
            <form onSubmit={manejarGuardar}>
                <div className="formulario-seccion">
                    <h3>Información Personal</h3>
                    <div className="formulario-grid">
                        <div className="campo-formulario">
                            <label>Nombre(s)*</label>
                            <input
                                type="text"
                                name="nombres"
                                value={formulario.nombres}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Ingresa tu nombre"
                                className={obtenerClaseCampo('nombres')}
                            />
                            {mostrarMensaje('nombres')}
                        </div>
                        <div className="campo-formulario">
                            <label>Apellido(s)*</label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formulario.apellidos}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Ingresa tus apellidos"
                                className={obtenerClaseCampo('apellidos')}
                            />
                            {mostrarMensaje('apellidos')}
                        </div>
                        <div className="campo-formulario">
                            <label>Nombre de Usuario*</label>
                            <input
                                type="text"
                                name="nombreUsuario"
                                value={formulario.nombreUsuario}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Usuario único"
                                className={obtenerClaseCampo('nombreUsuario')}
                            />
                            {mostrarMensaje('nombreUsuario')}
                        </div>
                        <div className="campo-formulario">
                            <label>Tipo de Documento*</label>
                            <select
                                name="tipoDocumento"
                                value={formulario.tipoDocumento}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                className={obtenerClaseCampo('tipoDocumento')}
                            >
                                <option value="">Seleccionar...</option>
                                {tiposDocumento.map((tipo) => (
                                    <option key={tipo.valor} value={tipo.valor}>
                                        {tipo.texto}
                                    </option>
                                ))}
                            </select>
                            {mostrarMensaje('tipoDocumento')}
                        </div>
                        <div className="campo-formulario">
                            <label>Número de Documento*</label>
                            <input
                                type="text"
                                name="numeroDocumento"
                                value={formulario.numeroDocumento}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="Número de identificación"
                                className={obtenerClaseCampo('numeroDocumento')}
                            />
                            {mostrarMensaje('numeroDocumento')}
                        </div>
                        <div className="campo-formulario">
                            <label>Correo Electrónico*</label>
                            <input
                                type="email"
                                name="correo"
                                value={formulario.correo}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="correo@ejemplo.com"
                                className={obtenerClaseCampo('correo')}
                            />
                            {mostrarMensaje('correo')}
                        </div>
                        <div className="campo-formulario">
                            <label>Contraseña{esEdicion ? ' (Opcional)' : '*'}</label>
                            <input
                                type="password"
                                name="contrasena"
                                value={formulario.contrasena}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="••••••••••••"
                                className={obtenerClaseCampo('contrasena')}
                            />
                            {mostrarMensaje('contrasena')}
                        </div>
                        <div className="campo-formulario">
                            <label>Confirmar Contraseña{esEdicion ? ' (Opcional)' : '*'}</label>
                            <input
                                type="password"
                                name="confirmarContrasena"
                                value={formulario.confirmarContrasena}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="••••••••••••"
                                className={obtenerClaseCampo('confirmarContrasena')}
                            />
                            {mostrarMensaje('confirmarContrasena')}
                        </div>
                        <div className="campo-formulario">
                            <label>Teléfono (Opcional)</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formulario.telefono}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                placeholder="3001234567"
                                className={obtenerClaseCampo('telefono')}
                            />
                            {mostrarMensaje('telefono')}
                        </div>
                        <div className="campo-formulario">
                            <label>Fecha de Nacimiento*</label>
                            <input
                                type="date"
                                name="fechaNacimiento"
                                value={formulario.fechaNacimiento}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                className={obtenerClaseCampo('fechaNacimiento')}
                            />
                            {mostrarMensaje('fechaNacimiento')}
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
                                    <span className="rol-descripcion">{rol.texto}</span>
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

                {esEdicion && (
                    <div className="formulario-seccion">
                        <h3>Estado del Usuario</h3>
                        <div className="campo-formulario">
                            <label>Estado*</label>
                            <select
                                name="estado"
                                value={formulario.estado}
                                onChange={manejarCambio}
                                onBlur={manejarBlur}
                                className={obtenerClaseCampo('estado')}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                            {mostrarMensaje('estado')}
                        </div>
                    </div>
                )}

                <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-guardar">
                        {esEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalUsuario;
