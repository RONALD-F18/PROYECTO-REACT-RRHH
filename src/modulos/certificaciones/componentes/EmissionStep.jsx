function EmissionStep({ form, onChange, errores = {} }) {
  const clsCiudad = errores.ciudad_emision ? 'cert-input cert-input--error' : 'cert-input';
  const clsFecha = errores.fecha_emision ? 'cert-input cert-input--error' : 'cert-input';
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="cert-step-grid cert-emision">
      <div>
        <label className="cert-label" htmlFor="cert-ciudad">
          Ciudad emisión *
        </label>
        <input
          id="cert-ciudad"
          className={clsCiudad}
          value={form.ciudad_emision}
          onChange={(e) => onChange('ciudad_emision', e.target.value)}
          onBlur={(e) => onChange('ciudad_emision', e.target.value)}
          placeholder="Ej: Medellín"
          maxLength={100}
          autoComplete="off"
        />
        {errores.ciudad_emision ? <span className="campo-seccion-error">{errores.ciudad_emision}</span> : null}
      </div>

      <div>
        <label className="cert-label" htmlFor="cert-fecha">
          Fecha emisión *
        </label>
        <input
          id="cert-fecha"
          type="date"
          className={clsFecha}
          value={form.fecha_emision}
          max={hoy}
          onChange={(e) => onChange('fecha_emision', e.target.value)}
          onBlur={(e) => onChange('fecha_emision', e.target.value)}
        />
        {errores.fecha_emision ? <span className="campo-seccion-error">{errores.fecha_emision}</span> : null}
        <p className="cert-campo-ayuda">Obligatoria. No puede ser una fecha futura (use año-mes-día).</p>
      </div>

      <div className="cert-step-grid cert-step-grid--full">
        <label className="cert-label" htmlFor="cert-descripcion">
          Observaciones / descripción (opcional)
        </label>
        <textarea
          id="cert-descripcion"
          className={errores.descripcion ? 'cert-input cert-input--error' : 'cert-input'}
          rows={4}
          value={form.descripcion}
          onChange={(e) => onChange('descripcion', e.target.value)}
          onBlur={(e) => onChange('descripcion', e.target.value)}
          maxLength={150}
        />
        {errores.descripcion ? <span className="campo-seccion-error">{errores.descripcion}</span> : null}
      </div>
    </div>
  );
}

export default EmissionStep;
