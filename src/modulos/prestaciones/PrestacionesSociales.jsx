import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';

function PrestacionesSociales() {
  const navegar = useNavigate();

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

      <TablaDatos
        columnas={[
          {
            campo: 'nombre',
            encabezado: 'Empleado',
            renderizar: (nombre, empleado) => (
              <div className="usuario-info">
                <span className="usuario-nombre">{nombre}</span>
                <span className="usuario-documento">C.C {empleado.documento}</span>
              </div>
            )
          },
          {
            campo: 'contrato',
            encabezado: 'Contrato',
            renderizar: (contrato, empleado) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{contrato}</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{empleado.periodo}</span>
              </div>
            )
          },
          { campo: 'cargo', encabezado: 'Cargo' },
          { campo: 'fechaInicio', encabezado: 'Fecha Inicio' }
        ]}
        datos={empleados}
        renderAcciones={(empleado) => (
          <button 
            className="btn btn-primario btn-sm"
            onClick={() => navegar(`/prestaciones/${empleado.id}`)}
          >
            Ver detalles
          </button>
        )}
      />
    </ContenedorPrincipal>
  );
}

export default PrestacionesSociales;
