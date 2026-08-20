import { SECCIONES, SECCIONES_FERRO } from '../data/documentos'
import { useApp } from '../store'
import { CARATULA } from '../data/project'

const LINEAS = [
  { id: 'ferro' as const, label: 'FERROVIARIO', sub: 'Vagones y componentes' },
  { id: 'alcaldia' as const, label: 'CÁRCELES', sub: 'Sistema modular' },
]

export default function Nav() {
  const linea = useApp((s) => s.linea)
  const setLinea = useApp((s) => s.setLinea)
  const seccion = useApp((s) => s.seccion)
  const irA = useApp((s) => s.irA)
  const items = linea === 'ferro' ? SECCIONES_FERRO : SECCIONES
  const total = items.length

  return (
    <nav className="nav">
      <button className="nav-marca" onClick={() => setLinea(null)}
        title="Volver a la pantalla de inicio" style={{ textAlign: 'left', width: '100%' }}>
        <div className="volver">← INICIO</div>
        <div className="t">MJ COMERCIAL</div>
        <div className="s">{linea === 'ferro' ? 'LÍNEA FERROVIARIA' : CARATULA.utilizacion}</div>
      </button>

      <div className="lineas">
        {LINEAS.map((l) => (
          <button key={l.id} className={`linea-btn${linea === l.id ? ' on' : ''}`}
            onClick={() => setLinea(l.id)}>
            <span className="l">{l.label}</span>
            <span className="s">{l.sub}</span>
          </button>
        ))}
      </div>

      <div className="nav-lista">
        {items.map((s, i) => (
          <button key={s.id} className={`nav-item${seccion === i + 1 ? ' on' : ''}`} onClick={() => irA(i + 1)}>
            <span className="n">{s.n}</span>
            <span className="l">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-pie">
        <div className="progreso"><i style={{ width: `${(Math.max(0, seccion) / total) * 100}%` }} /></div>
        <div className="eyebrow">
          {seccion === 0 ? 'PORTADA' : `${String(seccion).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </div>
      </div>
    </nav>
  )
}
