import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';
import { ModalEditarPeriodo } from './componentes';

function DetallesPrestaciones() {
    const { id } = useParams();
    const navegar = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [periodoEditar, setPeriodoEditar] = useState(null);

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

    const manejarEditarPeriodo = (calculo) => {
        setPeriodoEditar(calculo);
        setMostrarModal(true);
    };

    const manejarGuardarPeriodo = (datos) => {
        console.log('Guardar período de cálculo:', datos);
        setMostrarModal(false);
        setPeriodoEditar(null);
    };

    return (
        <ContenedorPrincipal>
            <EncabezadoModulo
                titulo="Prestaciones Sociales"
                subtitulo="Gestión, cálculo y pagos de beneficios laborales"
                mostrarBoton={false}
            />

            <button className="btn-volver" onClick={() => navegar('/prestaciones')} style={{ marginBottom: '24px' }}>
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
                    renderAcciones={(calculo) => (
                        <div className="tabla-acciones">
                            <button 
                                className="btn-accion-tabla btn-accion-editar"
                                title="Editar período"
                                onClick={() => manejarEditarPeriodo(calculo)}
                            >
                                ✎
                            </button>
                            <button 
                                className="btn-accion-tabla btn-accion-eliminar"
                                title="Eliminar período"
                                onClick={() => console.log('Eliminar período de cálculo:', calculo)}
                            >
                                🗑
                            </button>
                        </div>
                    )}
                />
            </div>

            <ModalEditarPeriodo
                mostrar={mostrarModal}
                cerrar={() => {
                    setMostrarModal(false);
                    setPeriodoEditar(null);
                }}
                datosPeriodo={periodoEditar}
                onGuardar={manejarGuardarPeriodo}
            />
        </ContenedorPrincipal>
    );
}

export default DetallesPrestaciones;

