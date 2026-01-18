import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';

function DetallesPrestaciones() {
    const { id: _id } = useParams();
    const navegar = useNavigate();

    const empleado = {
        nombre: 'Tatiana Cruz',
        cargo: 'Desarrolladora',
        salarioBase: '7.000.000'
    };

    const calculos = [
        {
            periodo: '02/02/2025 al 04/11/2025',
            dias: 365,
            cesantias: '$1.789.243',
            intereses: '$578.947',
            prima: '$3.578.947',
            vacaciones: '$2.578.947',
            estado: 'Pendiente',
            accion: 'Pagar'
        }
    ];

    const manejarCalcular = () => {
        console.log('Calcular prestaciones');
    };

    return (
        <ContenedorPrincipal>
            <EncabezadoModulo
                titulo="Prestaciones Sociales"
                subtitulo="Gestión, cálculo y pagos de beneficios laborales"
                mostrarBoton={false}
            />

            <button className="btn-volver" onClick={() => navegar('/prestaciones')}>
                ← Volver
            </button>

            <div className="detalles-prestaciones">
                <h2 className="detalles-titulo">Gestión de Prestaciones Sociales</h2>

                <div className="tarjeta-empleado">
                    <div className="tarjeta-empleado-info">
                        <div className="info-fila">
                            <span className="info-etiqueta">Empleado(a)</span>
                            <span className="info-valor">{empleado.nombre}</span>
                        </div>
                        <div className="info-fila">
                            <span className="info-etiqueta">Cargo</span>
                            <span className="info-valor">{empleado.cargo}</span>
                        </div>
                        <div className="info-fila">
                            <span className="info-etiqueta">Salario Base</span>
                            <span className="info-valor">{empleado.salarioBase}</span>
                        </div>
                    </div>
                    <button className="btn btn-exito" onClick={manejarCalcular}>
                        Calcular Prestaciones
                    </button>
                </div>

                <h2 className="detalles-titulo">Cálculos</h2>

                <TablaDatos
                    columnas={[
                        { campo: 'periodo', encabezado: 'Periodo' },
                        { campo: 'dias', encabezado: 'Días' },
                        { campo: 'cesantias', encabezado: 'Cesantías' },
                        { campo: 'intereses', encabezado: 'Intereses' },
                        { campo: 'prima', encabezado: 'Prima' },
                        { campo: 'vacaciones', encabezado: 'Vacaciones' },
                        {
                            campo: 'estado',
                            encabezado: 'Estado',
                            renderizar: (_, calculo) => (
                                <div className="estados-container">
                                    <span className="etiqueta etiqueta-amarilla">{calculo.estado}</span>
                                    <span className="etiqueta etiqueta-verde">{calculo.accion}</span>
                                </div>
                            )
                        }
                    ]}
                    datos={calculos}
                    acciones={false}
                />
            </div>
        </ContenedorPrincipal>
    );
}

export default DetallesPrestaciones;

