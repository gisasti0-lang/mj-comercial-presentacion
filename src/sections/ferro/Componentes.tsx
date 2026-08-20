import { useMemo, useState } from 'react'
import { SecHead, Aviso } from '../../components/ui'
import { COMPONENTES, CRITICIDAD_DEF, KIT_ENGANCHE, NORMAS, type Criticidad } from '../../data/ferrocarriles'
import { miniatura } from '../../three/miniaturas'

/** Miniatura tridimensional de la pieza. Si el componente no tiene geometría
 *  documentada se muestra el hueco rotulado en lugar de inventar una forma. */
/** Componentes cuya geometría sale de una cota de la documentación.
 *  El resto se dibuja de forma representativa y se rotula como tal. */
const ACOTADAS = new Set([
  'FRN-001', 'FRN-003', 'FRN-006', 'FRN-011',
  'BGE-001', 'BGE-003', 'BGE-004', 'BGE-006', 'BGE-007', 'BGE-008', 'BGE-009',
])

function Vista({ codigo }: { codigo: string }) {
  const url = useMemo(() => miniatura(codigo), [codigo])
  const acotada = ACOTADAS.has(codigo)
  return (
    <div style={{
      marginTop: 12, aspectRatio: '1/1', background: 'radial-gradient(circle at 50% 42%,#1b2026,#0d1013)',
      border: '1px solid var(--linea-2)', display: 'grid', placeItems: 'center', overflow: 'hidden',
      position: 'relative',
    }}>
      {url
        ? <img src={url} alt={codigo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : <span className="mono" style={{ fontSize: '.55rem', letterSpacing: '.15em', color: '#4d545b' }}>
            SIN GEOMETRÍA
          </span>}
      {url && (
        <span className="mono" style={{
          position: 'absolute', left: 8, bottom: 7, fontSize: '.5rem', letterSpacing: '.12em',
          color: acotada ? 'var(--acento-2)' : '#5c646c',
        }}>{acotada ? 'GEOMETRÍA ACOTADA' : 'REPRESENTATIVO'}</span>
      )}
    </div>
  )
}

export default function Componentes() {
  const [filtro, setFiltro] = useState<Criticidad | null>(null)
  const total = COMPONENTES.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="wrap-ancho">
      <SecHead n="02" titulo="Catálogo de componentes"
        bajada={`${total} componentes ferroviarios clasificados por criticidad operativa.`} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="eyebrow" style={{ marginRight: 6 }}>FILTRAR POR CRITICIDAD</span>
        <button className={`btn${filtro === null ? ' on' : ''}`} onClick={() => setFiltro(null)}>TODOS</button>
        {(['alta', 'media'] as Criticidad[]).map((c) => (
          <button key={c} className={`btn${filtro === c ? ' on' : ''}`} onClick={() => setFiltro(c)}>
            {CRITICIDAD_DEF[c].label}
          </button>
        ))}
      </div>

      {COMPONENTES.map((g) => {
        const items = g.items.filter((i) => !filtro || i.criticidad === filtro)
        if (!items.length) return null
        return (
          <section key={g.id} style={{ marginBottom: 38 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid var(--linea)', paddingBottom: 11, marginBottom: 18 }}>
              <span className="num">{g.n}</span>
              <h3>{g.titulo}</h3>
              <span className="eyebrow" style={{ color: '#4d545b' }}>{g.en}</span>
              <span className="cota" style={{ marginLeft: 'auto' }}>{items.length} ítems</span>
            </div>
            <div className="grid g3">
              {items.map((c) => (
                <div className="card" key={c.codigo} style={c.nuevo ? { borderColor: 'rgba(255,138,30,.4)' } : undefined}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div className="n">{c.codigo}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.nuevo && <span className="src src-cota">NUEVO</span>}
                      <span className="src" style={{
                        color: CRITICIDAD_DEF[c.criticidad].color,
                        borderColor: CRITICIDAD_DEF[c.criticidad].color + '55',
                        background: CRITICIDAD_DEF[c.criticidad].color + '14',
                      }}>{CRITICIDAD_DEF[c.criticidad].label}</span>
                    </div>
                  </div>
                  <Vista codigo={c.codigo} />
                  <h3 style={{ fontSize: '.86rem', marginTop: 9 }}>{c.nombre}</h3>
                  <div className="mono" style={{ fontSize: '.66rem', color: '#5c646c', marginTop: 5 }}>{c.en}</div>
                  {c.nota && <p style={{ marginTop: 10, fontSize: '.78rem' }}>{c.nota}</p>}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <div className="grid g3" style={{ borderTop: '1px solid var(--linea)', paddingTop: 32, alignItems: 'start' }}>
        <div className="ficha">
          <div className="ficha-h"><span className="t">CRITICIDAD</span></div>
          <div className="ficha-b" style={{ display: 'grid', gap: 14 }}>
            {(['alta', 'media'] as Criticidad[]).map((c) => (
              <div key={c} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span className="src" style={{
                  color: CRITICIDAD_DEF[c].color, borderColor: CRITICIDAD_DEF[c].color + '55',
                  background: CRITICIDAD_DEF[c].color + '14', flex: '0 0 auto',
                }}>{CRITICIDAD_DEF[c].label}</span>
                <span style={{ fontSize: '.79rem', color: '#9aa2a9' }}>{CRITICIDAD_DEF[c].desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ficha">
          <div className="ficha-h"><span className="t">NORMAS PRINCIPALES</span></div>
          <div className="ficha-b">
            {NORMAS.map((n) => (
              <div className="fila" key={n.sigla}>
                <span className="v" style={{ color: 'var(--acento-2)', textAlign: 'left' }}>{n.sigla}</span>
                <span className="k" style={{ textAlign: 'right', fontSize: '.75rem' }}>{n.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ficha">
          <div className="ficha-h"><span className="t">ENG-003 · CONTENIDO TÍPICO</span></div>
          <div className="ficha-b">
            {KIT_ENGANCHE.map(([es, en]) => (
              <div className="fila" key={es}>
                <span className="k" style={{ fontSize: '.79rem' }}>{es}</span>
                <span className="v" style={{ fontSize: '.68rem', color: '#5c646c' }}>{en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Aviso titulo="APLICACIÓN">
          Componentes diseñados para vagones de carga AAR: tolva, plataforma, góndola, tanque,
          furgón, portacontenedor y especiales.
        </Aviso>
      </div>
    </div>
  )
}
