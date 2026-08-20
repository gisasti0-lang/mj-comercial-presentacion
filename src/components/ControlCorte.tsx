import { useFerro, EJES_CORTE } from '../storeFerro'

/** Controles de corte compartidos por los visores ferroviarios. */
export default function ControlCorte() {
  const corte = useFerro((s) => s.corte)
  const setCorte = useFerro((s) => s.setCorte)

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <button className={`btn${corte.activo ? ' on' : ''}`}
        onClick={() => setCorte({ activo: !corte.activo })}>CORTE</button>

      {corte.activo && (
        <>
          {EJES_CORTE.map((e) => (
            <button key={e.id} className={`btn${corte.eje === e.id ? ' on' : ''}`}
              onClick={() => setCorte({ eje: e.id })}>{e.label}</button>
          ))}
          <input className="slider" type="range" min={0.02} max={0.98} step={0.005}
            value={corte.pos} onChange={(ev) => setCorte({ pos: +ev.target.value })}
            style={{ flex: 1, minWidth: 130, margin: '0 8px' }} />
          <span className="cota" style={{ width: 40 }}>{Math.round(corte.pos * 100)}%</span>
          <button className="btn" onClick={() => setCorte({ invertido: !corte.invertido })}>INVERTIR</button>
        </>
      )}
    </div>
  )
}
