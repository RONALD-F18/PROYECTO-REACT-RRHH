import { salarioNumericoDesdeContrato } from '../utils/certificacionesAfiliacion';

function ToggleEntidad({ etiqueta, detalle, incluido, onCambiar, deshabilitado }) {
  return (
    <label className={`cert-afiliacion-toggle ${incluido ? 'cert-afiliacion-toggle--on' : ''}`}>
      <input type="checkbox" checked={incluido} onChange={(e) => onCambiar(e.target.checked)} disabled={deshabilitado} />
      <div className="cert-afiliacion-toggle-texto">
        <span className="cert-afiliacion-toggle-titulo">{etiqueta}</span>
        {detalle ? <span className="cert-afiliacion-toggle-detalle">{detalle}</span> : null}
      </div>
    </label>
  );
}

function DetailsStep({ form, onChange, contratoSeleccionado, afiliacionVigente }) {
  const esAfiliaciones = String(form.tipo_certificacion).toUpperCase() === 'AFILIACIONES';
  const salarioContrato = salarioNumericoDesdeContrato(contratoSeleccionado);
  const salarioLegible =
    salarioContrato != null
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(salarioContrato)
      : null;

  const v = afiliacionVigente;
  const entidades = [];
  if (v?.cod_eps != null && v.cod_eps !== '')
    entidades.push({ campo: 'cod_eps', etiqueta: 'EPS', detalle: `Código ${v.cod_eps}` });
  if (v?.cod_arl != null && v.cod_arl !== '')
    entidades.push({ campo: 'cod_arl', etiqueta: 'ARL', detalle: `Código ${v.cod_arl}` });
  if (v?.cod_fondo_pensiones != null && v.cod_fondo_pensiones !== '')
    entidades.push({ campo: 'cod_pension', etiqueta: 'Pensión', detalle: `Código ${v.cod_fondo_pensiones}` });
  if (v?.cod_caja_compensacion != null && v.cod_caja_compensacion !== '')
    entidades.push({ campo: 'cod_caja', etiqueta: 'Caja de compensación', detalle: `Código ${v.cod_caja_compensacion}` });
  if (v?.cod_fondo_cesantias != null && v.cod_fondo_cesantias !== '')
    entidades.push({ campo: 'cod_cesantias', etiqueta: 'Fondo de cesantías', detalle: `Código ${v.cod_fondo_cesantias}` });

  const codigoDesdeAfiliacion = (campo) => {
    if (!v) return '';
    switch (campo) {
      case 'cod_eps':
        return String(v.cod_eps ?? '');
      case 'cod_arl':
        return String(v.cod_arl ?? '');
      case 'cod_pension':
        return String(v.cod_fondo_pensiones ?? '');
      case 'cod_caja':
        return String(v.cod_caja_compensacion ?? '');
      case 'cod_cesantias':
        return String(v.cod_fondo_cesantias ?? '');
      default:
        return '';
    }
  };

  return (
    <div className="cert-detalles-layout">
      {!esAfiliaciones ? (
      <div className="cert-detalles-bloque cert-detalles-bloque--salario">
        <label className="cert-label cert-label--inline" htmlFor="cert-incluye-salario">
          <input
            id="cert-incluye-salario"
            type="checkbox"
            checked={Boolean(form.incluye_salario)}
            onChange={(e) => onChange('incluye_salario', e.target.checked)}
          />
          Incluir salario en el certificado
        </label>

        {form.incluye_salario ? (
          <div className="cert-salario-contrato">
            {salarioLegible ? (
              <>
                <p className="cert-salario-valor">{salarioLegible}</p>
                <p className="cert-salario-ayuda">Tomado del contrato seleccionado. Se enviará este valor como salario certificado.</p>
              </>
            ) : (
              <p className="campo-seccion-error">
                No hay salario registrado en el contrato. Desmarque la opción o asocie un contrato con salario.
              </p>
            )}
          </div>
        ) : null}
      </div>
      ) : null}

      {esAfiliaciones ? (
        <div className="cert-detalles-bloque">
          <h4 className="cert-detalles-subtitulo">Entidades de afiliación (vigentes)</h4>
          <p className="cert-detalles-instruccion">
            Marque qué entidades desea incluir en la certificación. Los datos provienen de la afiliación vigente del empleado.
          </p>
          {!v ? (
            <p className="campo-seccion-error">
              No hay afiliación vigente (ACTIVA/APROBADA) para este empleado. Registre o active una afiliación primero.
            </p>
          ) : entidades.length === 0 ? (
            <p className="campo-seccion-error">La afiliación vigente no tiene códigos de entidades para incluir.</p>
          ) : (
            <div className="cert-afiliacion-toggle-lista">
              {entidades.map((ent) => {
                const codEsperado = codigoDesdeAfiliacion(ent.campo);
                const incluido = codEsperado !== '' && String(form[ent.campo] ?? '') === codEsperado;
                return (
                  <ToggleEntidad
                    key={ent.campo}
                    etiqueta={ent.etiqueta}
                    detalle={ent.detalle}
                    incluido={incluido}
                    deshabilitado={!codEsperado}
                    onCambiar={(si) => onChange(ent.campo, si ? codEsperado : '')}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default DetailsStep;
