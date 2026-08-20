import { useEffect, useState } from 'react'
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

  /* En pantallas chicas la lista no entra en una tira horizontal: se despliega
     a pantalla completa y se cierra al elegir. */
  const [abierto, setAbierto] = useState(false)
  useEffect(() => { setAbierto(false) }, [seccion, linea])
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const actual = seccion === 0 ? 'PORTADA' : items[seccion - 1]?.label ?? ''

  return (
    <nav className={`nav${abierto ? ' abierto' : ''}`}>
      <button className="nav-marca" onClick={() => setLinea(null)}
        title="Volver a la pantalla de inicio" style={{ textAlign: 'left', width: '100%' }}>
        <div className="volver">← INICIO</div>
        <div className="t">MJ COMERCIAL</div>
        <div className="s">{linea === 'ferro' ? 'LÍNEA FERROVIARIA' : CARATULA.utilizacion}</div>
      </button>

      {/* Disparador del menú: sólo se muestra en pantallas chicas */}
      <button className="nav-toggle" onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}>
        <span className="et">
          <span className="n">{seccion === 0 ? '—' : String(seccion).padStart(2, '0')}</span>
          <span className="l">{actual}</span>
        </span>
        <span className="ic">{abierto ? '✕' : '☰'}</span>
      </button>

      <div className="nav-cuerpo">
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
            <button key={s.id} className={`nav-item${seccion === i + 1 ? ' on' : ''}`}
              onClick={() => irA(i + 1)}>
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
      </div>
    </nav>
  )
}
