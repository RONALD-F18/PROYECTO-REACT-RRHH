import { TIPOS_CERTIFICACION } from '../utils/certificacionesValidation';

function CertificationTypeStep({ valor, onChange }) {
  return (
    <div className="cert-types-grid">
      {TIPOS_CERTIFICACION.map((tipo) => {
        const activo = valor === tipo.valor;
        return (
          <button
            key={tipo.valor}
            type="button"
            className={activo ? 'cert-type-card cert-type-card--active' : 'cert-type-card'}
            onClick={() => onChange(tipo.valor)}
          >
            <strong>{tipo.texto}</strong>
            <span>{tipo.valor === 'LABORAL' ? 'Cargo, salario y antiguedad' : 'EPS, ARL, pension, caja y cesantias'}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CertificationTypeStep;
