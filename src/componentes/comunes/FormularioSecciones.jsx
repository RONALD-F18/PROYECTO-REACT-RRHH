import '../../estilos/componentes/formulario-secciones.css';

/**
 * Componente de formulario con secciones numeradas
 * @param {Array} secciones - Array de objetos con {numero, titulo, color, icono, campos}
 * @param {Object} valores - Objeto con los valores del formulario
 * @param {Object} errores - Objeto con los errores de validación
 * @param {Object} camposTocados - Objeto que indica qué campos han sido tocados
 * @param {function} onChange - Función para manejar cambios en los campos
 * @param {function} onBlur - Función para manejar blur en los campos
 * @param {function} [onKeyUp] - Opcional: validación al escribir (p. ej. igual que onBlur)
 * @param {function} obtenerClaseCampo - Función para obtener clase CSS del campo
 * @param {function} mostrarMensaje - Función para mostrar mensajes de validación
 */
function FormularioSecciones({
  secciones = [],
  valores = {},
  errores = {},
  camposTocados = {},
  onChange,
  onBlur,
  onKeyUp,
  obtenerClaseCampo,
  mostrarMensaje,
  /** Oculta número + título de sección (p. ej. cuando el padre ya usa `FormularioPasos`). */
  ocultarEncabezadosSeccion = false,
}) {
  const renderizarCampo = (campo) => {
    const valor = valores[campo.nombre] || '';
    const error = errores[campo.nombre];
    const tocado = camposTocados[campo.nombre];
    const claseCampo = [
      obtenerClaseCampo ? obtenerClaseCampo(campo.nombre) : '',
      campo.deshabilitado ? 'campo-bloqueado' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const mensaje = mostrarMensaje ? mostrarMensaje(campo.nombre) : null;

    if (campo.tipo === 'select') {
      return (
        <div key={campo.nombre} className="campo-seccion">
          <label>
            {campo.etiqueta}
            {campo.requerido && <span className="requerido">*</span>}
          </label>
          <select
            name={campo.nombre}
            value={valor}
            onChange={onChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            className={claseCampo}
            disabled={campo.deshabilitado}
          >
            {!campo.selectSinVacio ? (
              <option value="">{campo.placeholder || 'Seleccione...'}</option>
            ) : null}
            {campo.opciones?.map((opcion, idx) => (
              <option key={idx} value={typeof opcion === 'string' ? opcion : opcion.valor}>
                {typeof opcion === 'string' ? opcion : opcion.texto}
              </option>
            ))}
          </select>
          {campo.hint && <span className="campo-seccion-hint">{campo.hint}</span>}
          {mensaje}
        </div>
      );
    }

    if (campo.tipo === 'date') {
      return (
        <div key={campo.nombre} className="campo-seccion">
          <label>
            {campo.etiqueta}
            {campo.requerido && <span className="requerido">*</span>}
          </label>
          <input
            type="date"
            name={campo.nombre}
            value={valor}
            onChange={onChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            className={claseCampo}
            placeholder={campo.placeholder}
          />
          {campo.hint && <span className="campo-seccion-hint">{campo.hint}</span>}
          {mensaje}
        </div>
      );
    }

    if (campo.tipo === 'textarea') {
      return (
        <div key={campo.nombre} className="campo-seccion" style={{ gridColumn: '1 / -1' }}>
          <label>
            {campo.etiqueta}
            {campo.requerido && <span className="requerido">*</span>}
          </label>
          <textarea
            name={campo.nombre}
            value={valor}
            onChange={onChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            className={claseCampo}
            placeholder={campo.placeholder}
            rows={campo.filas || 4}
            disabled={campo.deshabilitado}
          />
          {campo.hint && <span className="campo-seccion-hint">{campo.hint}</span>}
          {mensaje}
        </div>
      );
    }

    if (campo.tipo === 'readonly' || campo.calculado) {
      const valorMostrar = campo.valorPorDefecto !== undefined ? campo.valorPorDefecto : (valor || '0');
      return (
        <div key={campo.nombre} className="campo-seccion">
          <label>
            {campo.etiqueta}
            {campo.requerido && <span className="requerido">*</span>}
          </label>
          <div className="campo-calculado">
            <span className="campo-calculado-valor">{valorMostrar}</span>
            {campo.sufijo && <span className="campo-calculado-sufijo">{campo.sufijo}</span>}
          </div>
          {campo.hint && <span className="campo-seccion-hint">{campo.hint}</span>}
        </div>
      );
    }

    return (
      <div key={campo.nombre} className="campo-seccion">
        <label>
          {campo.etiqueta}
          {campo.requerido && <span className="requerido">*</span>}
        </label>
        <input
          type={campo.tipo || 'text'}
          name={campo.nombre}
          value={valor}
          onChange={onChange}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          className={claseCampo}
          placeholder={campo.placeholder}
          disabled={campo.deshabilitado}
        />
        {campo.hint && <span className="campo-seccion-hint">{campo.hint}</span>}
        {mensaje}
      </div>
    );
  };

  return (
    <div
      className={`formulario-secciones${ocultarEncabezadosSeccion ? ' formulario-secciones--solo-campos' : ''}`}
    >
      {secciones.map((seccion, indice) => (
        <div
          key={indice}
          className={`seccion-formulario${ocultarEncabezadosSeccion ? ' seccion-formulario--sin-encabezado' : ''}`}
        >
          {!ocultarEncabezadosSeccion ? (
            <div className="seccion-formulario-header">
              <div className={`seccion-formulario-numero ${seccion.color}`}>
                {seccion.numero}
              </div>
              <h3 className="seccion-formulario-titulo">
                {seccion.icono && <span className="seccion-formulario-icono">{seccion.icono}</span>}
                {seccion.titulo}
              </h3>
            </div>
          ) : null}
          <div className="seccion-formulario-campos">
            {seccion.campos.map(renderizarCampo)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FormularioSecciones;

