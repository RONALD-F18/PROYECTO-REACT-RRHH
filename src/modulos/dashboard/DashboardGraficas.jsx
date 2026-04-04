/**
 * Gráficos del panel sin librerías externas (evita fallos si falta el paquete en Docker/volúmenes).
 */

function maximoSeguro(valores) {
  const m = Math.max(0, ...valores.map((n) => Number(n) || 0));
  return m > 0 ? m : 1;
}

/** Barras horizontales: { nombre, valor }[] — escala relativa al máximo del listado */
export function GraficaBarrasDashboard({ datos }) {
  const max = maximoSeguro(datos.map((d) => d.valor));
  return (
    <div className="dashboard-chart-barras-wrap">
      <p className="dashboard-chart-barras-leyenda">
        Barras proporcionales al <strong>valor más alto</strong> de esta lista ({max}).
      </p>
      <ul className="dashboard-chart-barras">
        {datos.map((d) => (
          <li key={d.nombre} className="dashboard-chart-barras-fila">
            <span className="dashboard-chart-barras-label" title={d.nombre}>
              {d.nombre}
            </span>
            <div className="dashboard-chart-barras-track">
              <div
                className="dashboard-chart-barras-fill"
                style={{ width: `${(Number(d.valor) / max) * 100}%` }}
                title={`${d.valor} (${Math.round((Number(d.valor) / max) * 100)}% del máximo)`}
              />
            </div>
            <span className="dashboard-chart-barras-val">{d.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tendencia 6 meses: { nombre, total }[] — con rejilla y eje Y */
export function GraficaLineaInasistencias({ datos }) {
  const max = maximoSeguro(datos.map((d) => d.total));
  const w = 340;
  const h = 152;
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = datos.length;
  const puntos = datos.map((d, i) => {
    const x = padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = padT + innerH - (Number(d.total) / max) * innerH;
    return { x, y, nombre: d.nombre, total: d.total };
  });
  const polylinePts = puntos.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPts = `${padL},${padT + innerH} ${polylinePts} ${padL + innerW},${padT + innerH}`;
  const y0 = padT + innerH;
  const yMid = padT + innerH / 2;
  const yTop = padT;
  const midVal = Math.round(max / 2);

  return (
    <div className="dashboard-chart-linea-wrap">
      <p className="dashboard-chart-linea-leyenda">Pasa el cursor por los puntos para ver el detalle.</p>
      <svg
        className="dashboard-chart-linea-svg"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="dashboardLineaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Rejilla horizontal */}
        <line x1={padL} y1={y0} x2={padL + innerW} y2={y0} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padL} y1={yMid} x2={padL + innerW} y2={yMid} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={padL} y1={yTop} x2={padL + innerW} y2={yTop} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <text x={4} y={y0 + 3} fontSize="9" fill="#94a3b8">
          0
        </text>
        <text x={4} y={yMid + 3} fontSize="9" fill="#94a3b8">
          {midVal}
        </text>
        <text x={4} y={yTop + 9} fontSize="9" fill="#94a3b8">
          {max}
        </text>
        <polygon points={areaPts} fill="url(#dashboardLineaGrad)" />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylinePts}
        />
        {puntos.map((p, i) => (
          <g key={i}>
            <title>
              {p.nombre}: {p.total} registros
            </title>
            <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2" className="dashboard-chart-linea-punto" />
          </g>
        ))}
      </svg>
      <div className="dashboard-chart-linea-ejes">
        {datos.map((d) => (
          <span key={d.nombre} className="dashboard-chart-linea-mes">
            {d.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Dona contratos: items { name, value, fill } */
export function GraficaDonutContratos({ items, total }) {
  if (!total || total <= 0) return null;
  const list = items.filter((x) => Number(x.value) > 0);
  if (list.length === 0) return null;

  let acum = 0;
  const segmentos = list.map((x) => {
    const pct = (Number(x.value) / total) * 100;
    const desde = acum;
    acum += pct;
    return { ...x, desde, hasta: acum, pct };
  });

  const gradientStops = segmentos.map((s) => `${s.fill} ${s.desde}% ${s.hasta}%`).join(', ');
  const vigentes = list.find((x) => x.name === 'Vigentes');
  const fraccion =
    vigentes && total > 0 ? Math.round((Number(vigentes.value) / total) * 100) : null;

  return (
    <div className="dashboard-chart-donut-wrap">
      <div className="dashboard-chart-donut-visual">
        <div
          className="dashboard-chart-donut-ring"
          style={{ background: `conic-gradient(${gradientStops})` }}
          role="img"
          aria-label={`Contratos: ${total} en total`}
        />
        <div className="dashboard-chart-donut-centro">
          <span className="dashboard-chart-donut-centro-num">{total}</span>
          <span className="dashboard-chart-donut-centro-txt">contratos</span>
        </div>
      </div>
      <div className="dashboard-chart-donut-leyenda">
        {fraccion != null && (
          <p className="dashboard-chart-donut-hint">
            <strong>{fraccion}%</strong> del total son contratos vigentes.
          </p>
        )}
        {list.map((x) => (
          <div key={x.name} className="dashboard-chart-donut-item">
            <span className="dashboard-chart-donut-swatch" style={{ background: x.fill }} />
            <span className="dashboard-chart-donut-nombre">{x.name}</span>
            <span className="dashboard-chart-donut-num">{x.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
