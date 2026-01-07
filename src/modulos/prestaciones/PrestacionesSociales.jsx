import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';

function PrestacionesSociales() {
  const empleados = [
    { id: 1, nombre: 'Carlos Andrés Gomez', documento: '1015432198', contrato: 'N°52265', periodo: 'Desde Enero 2024', cargo: 'Desarrollador', fechaInicio: '03-09-2006' },
    { id: 2, nombre: 'María Fernanda López', documento: '1020567834', contrato: 'N°52266', periodo: 'Desde Enero 2024', cargo: 'Aux Contable', fechaInicio: '03-09-2006' },
    { id: 3, nombre: 'Juan Pablo Martínez', documento: '1025678901', contrato: 'N°52267', periodo: 'Desde Enero 2024', cargo: 'RRHH', fechaInicio: '03-09-2006' },
    { id: 4, nombre: 'Andrea Carolina Silva', documento: '1033705584', contrato: 'N°52268', periodo: 'Desde Enero 2024', cargo: 'Diseñador', fechaInicio: '03-09-2006' },
  ];

  const tarjetasPrestaciones = [
    { titulo: 'Prima de Servicios', valor: '$14,500,000', color: 'verde' },
    { titulo: 'Cesantías', valor: '$7,500,000', color: 'azul' },
    { titulo: 'Interés Cesantías', valor: '$4,500,000', color: 'morado' },
    { titulo: 'Vacaciones', valor: '$4,500,000', color: 'naranja' },
  ];

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Prestaciones Sociales"
        subtitulo="Gestión, cálculo y pagos de beneficios laborales"
        mostrarBoton={false}
      />

      <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Gestión de Prestaciones Sociales</h2>

      <div className="tarjetas-prestaciones" style={{ marginBottom: '24px' }}>
        {tarjetasPrestaciones.map((tarjeta, indice) => (
          <div key={indice} className={`tarjeta-prestacion ${tarjeta.color}`}>
            <div className="tarjeta-prestacion-info">
              <h3>{tarjeta.titulo}</h3>
              <p className="tarjeta-prestacion-valor">{tarjeta.valor}</p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.6)' }}></div>
          </div>
        ))}
      </div>

      <div className="contenedor-tabla">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Contrato</th>
              <th>Cargo</th>
              <th>Fecha Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{empleado.nombre}</span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>C.C {empleado.documento}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{empleado.contrato}</span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{empleado.periodo}</span>
                  </div>
                </td>
                <td>{empleado.cargo}</td>
                <td>{empleado.fechaInicio}</td>
                <td>
                  <button className="btn btn-primario btn-sm">Ver detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContenedorPrincipal>
  );
}

export default PrestacionesSociales;
