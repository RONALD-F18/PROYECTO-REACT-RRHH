import { nombreCompletoEmpleado } from '../../../services/empleados';

function EmployeeSelector({ empleados = [], valor, onSeleccionar, busqueda, onBusqueda }) {
  const query = String(busqueda || '').trim().toLowerCase();
  const filtrados = empleados.filter((e) => {
    if (!query) return true;
    const blob = [nombreCompletoEmpleado(e), e.doc_iden, e.correo].join(' ').toLowerCase();
    return blob.includes(query);
  });

  return (
    <div className="cert-step-card">
      <label className="cert-label" htmlFor="cert-empleado-buscar">
        Buscar empleado o documento
      </label>
      <input
        id="cert-empleado-buscar"
        className="cert-input"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder="Nombre o identificación..."
      />

      <label className="cert-label" htmlFor="cert-empleado-select">
        Empleado *
      </label>
      <select
        id="cert-empleado-select"
        className="cert-input"
        value={valor}
        onChange={(e) => onSeleccionar(e.target.value)}
      >
        <option value="">Seleccione un empleado...</option>
        {filtrados.map((e) => (
          <option key={String(e.cod_empleado ?? e.id)} value={String(e.cod_empleado ?? e.id)}>
            {nombreCompletoEmpleado(e)} - {e.doc_iden ?? 'Sin documento'}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EmployeeSelector;
