function etiquetaContrato(c) {
  const codigo = c.cod_contrato != null ? String(c.cod_contrato) : '—';
  const tipo = c.tipo_contrato ?? 'Sin tipo';
  const cargo = c.cargo?.nombre_cargo ?? c.cargo?.nom_cargo ?? c.cargo ?? 'Sin cargo';
  return `${codigo} - ${tipo} (${cargo})`;
}

function ContractSelector({ contratos = [], valor, onSeleccionar }) {
  const contratoActual = contratos.find((c) => String(c.cod_contrato) === String(valor));

  return (
    <div className="cert-step-card">
      <label className="cert-label" htmlFor="cert-contrato-select">
        Seleccionar contrato (opcional)
      </label>
      <select
        id="cert-contrato-select"
        className="cert-input"
        value={valor}
        onChange={(e) => onSeleccionar(e.target.value)}
      >
        <option value="">Sin contrato</option>
        {contratos.map((c) => (
          <option key={String(c.cod_contrato)} value={String(c.cod_contrato)}>
            {etiquetaContrato(c)}
          </option>
        ))}
      </select>

      {contratoActual ? (
        <div className="cert-ref-grid">
          <p>
            <strong>Cargo:</strong> {contratoActual.cargo?.nombre_cargo ?? contratoActual.cargo ?? '—'}
          </p>
          <p>
            <strong>Fecha ingreso:</strong> {String(contratoActual.fecha_inicio ?? '').slice(0, 10) || '—'}
          </p>
          <p>
            <strong>Tipo:</strong> {contratoActual.tipo_contrato ?? '—'}
          </p>
          <p>
            <strong>Salario base:</strong> {contratoActual.salario_base ?? contratoActual.salario ?? '—'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default ContractSelector;
