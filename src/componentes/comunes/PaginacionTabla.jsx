/**
 * Controles Anterior / Siguiente para listados paginados del API.
 */
function PaginacionTabla({ meta, onCambiarPagina, cargando = false, className = '' }) {
  if (!meta || meta.last_page <= 1) return null;

  const pagina = meta.current_page;
  const total = meta.total;
  const porPagina = meta.per_page;
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <nav
      className={`paginacion-tabla ${className}`.trim()}
      aria-label="Paginación de la tabla"
    >
      <p className="paginacion-tabla-resumen">
        Mostrando <strong>{desde}</strong>–<strong>{hasta}</strong> de <strong>{total}</strong>
        {' · '}
        Página <strong>{pagina}</strong> de <strong>{meta.last_page}</strong>
      </p>
      <div className="paginacion-tabla-botones">
        <button
          type="button"
          className="paginacion-tabla-btn"
          disabled={cargando || pagina <= 1}
          onClick={() => onCambiarPagina(pagina - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="paginacion-tabla-btn"
          disabled={cargando || pagina >= meta.last_page}
          onClick={() => onCambiarPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}

export default PaginacionTabla;
