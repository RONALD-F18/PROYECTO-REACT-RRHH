import './DataTable.css'

function DataTable({ columns, data, onEdit, onView, onDelete, colorTheme = 'blue' }) {
  return (
    <div className="data-table-container">
      <table className={`data-table theme-${colorTheme}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(row[col.field], row) : row[col.field]}
                </td>
              ))}
              <td>
                <div className="table-actions">
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(row)} title="Editar">
                      ✎
                    </button>
                  )}
                  {onView && (
                    <button className="action-btn view" onClick={() => onView(row)} title="Ver">
                      👁
                    </button>
                  )}
                  {onDelete && (
                    <button className="action-btn delete" onClick={() => onDelete(row)} title="Eliminar">
                      🗑
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable