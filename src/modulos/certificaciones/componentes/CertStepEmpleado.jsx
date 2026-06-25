import { nombreCompletoEmpleado } from '../../../services/empleados';

function CertStepEmpleado({
  empresas = [],
  empleados = [],
  contratosDelEmpleado = [],
  form,
  errores,
  onEmpresaChange,
  onDocumentoChange,
  onDocumentoBlur,
  onContratoManual,
  documentoSoloLectura = false,
}) {
  const empleadoHallado =
    form.cod_empleado &&
    empleados.find((e) => String(e.cod_empleado ?? e.id) === String(form.cod_empleado));

  const nombreMostrar = empleadoHallado ? nombreCompletoEmpleado(empleadoHallado) : '—';
  const docMostrar = empleadoHallado?.doc_iden ?? '—';

  const variosContratos = contratosDelEmpleado.length > 1;

  return (
    <div className="cert-paso-empleado">
      <div className="cert-paso-empleado-fila">
        <div className="cert-paso-empleado-campo cert-paso-empleado-campo--empresa">
          <label className="cert-label" htmlFor="cert-empresa">
            Empresa *
          </label>
          <select
            id="cert-empresa"
            className="cert-input"
            value={form.id_empresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {empresas.map((emp) => (
              <option key={String(emp.id_empresa)} value={String(emp.id_empresa)}>
                {emp.nom_empresa ?? emp.nombre_empresa ?? `Empresa ${emp.id_empresa}`}
              </option>
            ))}
          </select>
          {errores.id_empresa ? <span className="campo-seccion-error">{errores.id_empresa}</span> : null}
        </div>

        <div className="cert-paso-empleado-campo cert-paso-empleado-campo--documento">
          <label className="cert-label" htmlFor="cert-documento">
            Número de documento *
          </label>
          <input
            id="cert-documento"
            className={`cert-input${documentoSoloLectura ? ' campo-bloqueado' : ''}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej: 1128455781"
            value={form.documento_consulta}
            onChange={(e) => onDocumentoChange(e.target.value)}
            onBlur={onDocumentoBlur}
            readOnly={documentoSoloLectura}
            aria-readonly={documentoSoloLectura || undefined}
          />
          {documentoSoloLectura ? (
            <p className="cert-paso-empleado-aviso-doc">Al editar no se puede cambiar el documento; la certificación sigue asociada al mismo empleado.</p>
          ) : null}
          {errores.documento_consulta ? <span className="campo-seccion-error">{errores.documento_consulta}</span> : null}
          {errores.cod_empleado ? <span className="campo-seccion-error">{errores.cod_empleado}</span> : null}
        </div>
      </div>

      <div className="cert-paso-empleado-resumen">
        <div className="cert-paso-empleado-resumen-item">
          <span className="cert-label">Empleado</span>
          <strong className="cert-paso-empleado-nombre">{nombreMostrar}</strong>
        </div>
        <div className="cert-paso-empleado-resumen-item">
          <span className="cert-label">Documento</span>
          <strong>{docMostrar}</strong>
        </div>
      </div>

      {variosContratos ? (
        <div className="cert-paso-empleado-campo">
          <label className="cert-label" htmlFor="cert-contrato-multi">
            Contrato asociado *
          </label>
          <select
            id="cert-contrato-multi"
            className="cert-input"
            value={form.cod_contrato}
            onChange={(e) => onContratoManual(e.target.value)}
          >
            <option value="">Seleccione contrato…</option>
            {contratosDelEmpleado.map((c) => (
              <option key={String(c.cod_contrato)} value={String(c.cod_contrato)}>
                {c.cod_contrato} — {c.tipo_contrato ?? 'Contrato'}
              </option>
            ))}
          </select>
          {errores.cod_contrato ? <span className="campo-seccion-error">{errores.cod_contrato}</span> : null}
        </div>
      ) : contratosDelEmpleado.length === 1 ? (
        <p className="cert-paso-empleado-contrato-auto">
          <span className="cert-label">Contrato</span>{' '}
          <strong>
            {contratosDelEmpleado[0].cod_contrato} — {contratosDelEmpleado[0].tipo_contrato ?? 'Asignado automáticamente'}
          </strong>
        </p>
      ) : empleadoHallado ? (
        <p className="campo-seccion-error cert-paso-empleado-sin-contrato">Este empleado no tiene contratos registrados.</p>
      ) : null}
    </div>
  );
}

export default CertStepEmpleado;
