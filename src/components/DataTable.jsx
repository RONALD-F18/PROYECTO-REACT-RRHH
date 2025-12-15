import "./DataTable.css";

function DataTable({ columns, data }) {
  return (
    <div className="data-table-container">
      <table className="data-table">
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
                <td key={colIdx}>{row[col.field]}</td>
              ))}
              <td>
                <div className="table-actions">
                  <button className="action-btn">✎</button>
                  <button className="action-btn">👁</button>
                  <button className="action-btn">🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
