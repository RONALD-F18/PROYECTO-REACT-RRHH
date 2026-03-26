import { useState } from 'react';
import '../../../estilos/componentes/filtros.css';
import '../../../estilos/modulos/certificaciones.css';

const OPCIONES_TIPO = [
  { valor: 'LABORAL', texto: 'Laboral' },
  { valor: 'AFILIACIONES', texto: 'Afiliaciones' },
];

/**
 * Un solo panel: búsqueda, tipo, rango fecha emisión y Filtrar aplican todos los criterios juntos.
 */
function CertificacionesFiltros({ onAplicar }) {
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const aplicar = () => {
    onAplicar?.({
      busqueda: busqueda.trim(),
      tipo: tipo || '',
      desde: desde || '',
      hasta: hasta || '',
    });
  };

  const limpiarFechas = () => {
    setDesde('');
    setHasta('');
  };

  const limpiarTodo = () => {
    setBusqueda('');
    setTipo('');
    setDesde('');
    setHasta('');
    onAplicar?.({ busqueda: '', tipo: '', desde: '', hasta: '' });
  };

  const manejarKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aplicar();
    }
  };

  return (
    <div className="bloque-filtros cert-filtros-unificado">
      <div className="cert-filtros-unificado-cabecera">
        <h2 className="cert-filtros-unificado-titulo">Filtrar certificaciones</h2>
        <p className="cert-filtros-unificado-sub">
          Búsqueda, tipo y fechas de emisión se aplican al pulsar <strong>Filtrar</strong> (o Enter en el campo de búsqueda).
        </p>
      </div>

      <div className="cert-filtros-unificado-grid">
        <div className="filtro-select-grupo filtro-select-grupo--busqueda">
          <label className="filtro-select-etiqueta filtro-select-etiqueta--placeholder" aria-hidden>
            Búsqueda
          </label>
          <div className="caja-busqueda">
            <span className="icono-busqueda" aria-hidden />
            <input
              type="text"
              placeholder="Nombre o identificación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={manejarKeyDown}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="filtro-select-grupo">
          <label className="filtro-select-etiqueta" htmlFor="cert-filtro-tipo">
            Tipo
          </label>
          <select
            id="cert-filtro-tipo"
            className="filtro-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {OPCIONES_TIPO.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </div>

        <div className="cert-filtros-fecha-grupo">
          <label className="filtro-select-etiqueta" htmlFor="cert-filtro-desde">
            Emisión desde
          </label>
          <input
            id="cert-filtro-desde"
            type="date"
            className="cert-filtros-fecha-input"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            aria-label="Fecha de emisión desde"
          />
        </div>
        <div className="cert-filtros-fecha-grupo">
          <label className="filtro-select-etiqueta" htmlFor="cert-filtro-hasta">
            Emisión hasta
          </label>
          <input
            id="cert-filtro-hasta"
            type="date"
            className="cert-filtros-fecha-input"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            aria-label="Fecha de emisión hasta"
          />
        </div>

        <div className="cert-filtros-acciones">
          <button type="button" className="cert-filtros-btn-secundario" onClick={limpiarFechas}>
            Limpiar fechas
          </button>
          <button type="button" className="cert-filtros-btn-secundario cert-filtros-btn-secundario--muted" onClick={limpiarTodo}>
            Limpiar todo
          </button>
          <button type="button" className="btn-filtrar cert-filtros-btn-primario" onClick={aplicar}>
            <span className="icono-busqueda" aria-hidden />
            Filtrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CertificacionesFiltros;
