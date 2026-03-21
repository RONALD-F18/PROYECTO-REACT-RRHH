import { Component } from 'react';

/**
 * Evita pantalla en blanco ante errores de render: muestra mensaje y opción de recargar.
 */
export default class LimiteError extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('LimiteError:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 720,
            margin: '48px auto',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ color: '#b91c1c', fontSize: '1.25rem' }}>Algo falló en la interfaz</h1>
          <p style={{ color: '#334155', lineHeight: 1.5 }}>
            Vuelve a cargar la página. Si el error continúa, copia el texto de abajo (consola o soporte).
          </p>
          <pre
            style={{
              background: '#f1f5f9',
              padding: 16,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 12,
              color: '#0f172a',
            }}
          >
            {error?.message}
            {error?.stack ? `\n\n${error.stack}` : ''}
          </pre>
          <button
            type="button"
            style={{
              marginTop: 16,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
