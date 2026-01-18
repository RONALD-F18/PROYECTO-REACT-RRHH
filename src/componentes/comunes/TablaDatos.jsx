/**
 * Componente de tabla de datos reutilizable
 * @param {Array} columnas - Array de objetos {campo, encabezado, renderizar?}
 * @param {Array} datos - Array de objetos con los datos
 * @param {boolean} acciones - Mostrar columna de acciones
 * @param {function} renderAcciones - Función para renderizar acciones personalizadas
 */
function TablaDatos({ columnas, datos, acciones = true, renderAcciones }) {
  return (
    <div className="contenedor-tabla">
      <table className="tabla-datos">
        <thead>
          <tr>
            {columnas.map((col, indice) => (
              <th key={indice}>{col.encabezado}</th>
            ))}
            {acciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {datos.length > 0 ? (
            datos.map((fila, indiceFila) => (
              <tr key={indiceFila}>
                {columnas.map((col, indiceCol) => (
                  <td key={indiceCol}>
                    {col.renderizar
                      ? col.renderizar(fila[col.campo], fila)
                      : fila[col.campo]}
                  </td>
                ))}
                {acciones && (
                  <td>
                    <div className="tabla-acciones">
                      {renderAcciones ? (
                        renderAcciones(fila)
                      ) : (
                        <>
                          <button className="btn-accion-tabla" title="Editar">✎</button>
                          <button className="btn-accion-tabla" title="Ver">👁</button>
                          <button className="btn-accion-tabla" title="Eliminar">🗑</button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columnas.length + (acciones ? 1 : 0)}>
                <div className="tabla-sin-datos">
                  No hay datos disponibles
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaDatos;
