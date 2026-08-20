import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SecHead, Lamina, Fila, Ficha } from '../components/ui'
import { COTAS, ETAPAS, MEMORIA } from '../data/project'
import { useApp } from '../store'

/* ── Secuencia de ensamblaje de la unidad mínima ────────────────── */
const PIEZAS = [
  { id: 'cel', l: 'MÓDULO CELADURÍA', x: 0, y: 0, w: 90, h: 30, from: { y: -34 }, cota: '9000 × 3000' },
  { id: 'ca', l: 'MÓDULO CELDAS', x: 0, y: 30, w: 30, h: 120, from: { x: -34 }, cota: '3000 × 12000' },
  { id: 'pa', l: 'PATIO / CORREDOR', x: 30, y: 30, w: 30, h: 120, from: { y: 34 }, cota: '3000 × 12000' },
  { id: 'cb', l: 'MÓDULO CELDAS', x: 60, y: 30, w: 30, h: 120, from: { x: 34 }, cota: '3000 × 12000' },
]

function Ensamblaje() {
  const [paso, setPaso] = useState(4)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setPaso((p) => (p >= 4 ? 1 : p + 1)), 1250)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div>
      <svg viewBox="-16 -16 122 182" style={{ width: '100%', maxWidth: 330, margin: '0 auto', display: 'block' }}>
        {PIEZAS.map((p, i) => {
          const on = paso > i
          return (
            <motion.g key={p.id} initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : (p.from.x ?? 0), y: on ? 0 : (p.from.y ?? 0) }}
              transition={{ duration: .62, ease: [.16, 1, .3, 1] }}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h}
                fill={p.id === 'pa' ? 'rgba(255,138,30,.13)' : 'rgba(255,255,255,.045)'}
                stroke={i === paso - 1 ? '#ff8a1e' : '#4a525c'} strokeWidth={i === paso - 1 ? 1.3 : 0.8} />
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 1.4}
                fill={i === paso - 1 ? '#eef1f3' : '#8b9298'} fontFamily="var(--mono)" fontSize={4.3}
                textAnchor="middle"
                transform={p.h > p.w ? `rotate(-90 ${p.x + p.w / 2} ${p.y + p.h / 2})` : undefined}>
                {p.l}
              </text>
            </motion.g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PIEZAS.map((p, i) => (
          <button key={p.id} className={`btn${paso === i + 1 ? ' on' : ''}`}
            onClick={() => { setAuto(false); setPaso(i + 1) }}>{String(i + 1).padStart(2, '0')}</button>
        ))}
        <button className={`btn${auto ? ' on' : ''}`} onClick={() => setAuto((a) => !a)}>
          {auto ? '❚❚' : '▶'}
        </button>
      </div>
      <div className="cota" style={{ textAlign: 'center', marginTop: 10 }}>
        {PIEZAS[Math.max(0, paso - 1)].l} · {PIEZAS[Math.max(0, paso - 1)].cota} mm
      </div>
    </div>
  )
}

/* ── Crecimiento longitudinal ───────────────────────────────────── */
function Crecimiento() {
  const tramos = useApp((s) => s.tramos)
  const setTramos = useApp((s) => s.setTramos)
  const etapa = ETAPAS[tramos - 1]

  return (
    <div>
      <svg viewBox="-8 -10 116 96" style={{ width: '100%', maxWidth: 520 }}>
        <rect x={0} y={0} width={26} height={12} fill="rgba(255,255,255,.06)" stroke="#4a525c" strokeWidth={.7} />
        <text x={13} y={7.6} fill="#8b9298" fontFamily="var(--mono)" fontSize={3.4} textAnchor="middle">CELADURÍA</text>
        {[0, 1, 2, 3].map((k) => {
          const on = k < tramos
          return (
            <motion.g key={k} initial={false} animate={{ opacity: on ? 1 : 0.09 }} transition={{ duration: .45 }}>
              <rect x={0} y={12 + k * 17} width={8} height={16} fill="rgba(255,255,255,.05)" stroke={on ? '#ff8a1e' : '#3a424c'} strokeWidth={.7} />
              <rect x={9} y={12 + k * 17} width={8} height={16} fill="rgba(255,138,30,.13)" stroke={on ? '#ff8a1e' : '#3a424c'} strokeWidth={.7} />
              <rect x={18} y={12 + k * 17} width={8} height={16} fill="rgba(255,255,255,.05)" stroke={on ? '#ff8a1e' : '#3a424c'} strokeWidth={.7} />
              <text x={31} y={21.5 + k * 17} fill={on ? '#f0b323' : '#3a424c'} fontFamily="var(--mono)" fontSize={3.2}>
                TRAMO {k + 1} · 12000 mm · 24 plazas
              </text>
            </motion.g>
          )
        })}
        <line x1={-3} y1={0} x2={-3} y2={12 + tramos * 17} stroke="#f0b323" strokeWidth={.5} opacity={.6} />
        <text x={-5} y={(12 + tramos * 17) / 2} fill="#f0b323" fontFamily="var(--mono)" fontSize={3.4}
          textAnchor="middle" transform={`rotate(-90 -5 ${(12 + tramos * 17) / 2})`}>{etapa.largo}</text>
      </svg>

      <div className="timeline">
        {ETAPAS.map((e, i) => (
          <div className="tl-nodo" key={e.n}>
            <button className={`tl-p${tramos >= e.n ? ' on' : ''}`} onClick={() => setTramos(e.n)}
              aria-label={`Etapa ${e.n}`} />
            {i < ETAPAS.length - 1 && <div className={`tl-l${tramos > e.n ? ' on' : ''}`} />}
          </div>
        ))}
      </div>
      <div className="tl-labels">
        {ETAPAS.map((e) => (
          <span key={e.n} style={{ width: 78, textAlign: e.n === 1 ? 'left' : e.n === 4 ? 'right' : 'center' }}>
            {tramos === e.n ? <b>0{e.n}</b> : `0${e.n}`}
          </span>
        ))}
      </div>
      <input className="slider" type="range" min={1} max={4} step={1} value={tramos}
        onChange={(e) => setTramos(+e.target.value)} style={{ marginTop: 16 }} />
      <div className="grid g3" style={{ marginTop: 20, gap: 12 }}>
        <Ficha titulo="ETAPA"><div className="cota" style={{ fontSize: '1.5rem' }}>0{etapa.n}</div></Ficha>
        <Ficha titulo="LARGO TOTAL"><div className="cota" style={{ fontSize: '1.5rem' }}>{etapa.largo}</div></Ficha>
        <Ficha titulo="PLAZAS"><div className="cota" style={{ fontSize: '1.5rem' }}>{etapa.plazas}</div></Ficha>
      </div>
      <p style={{ fontSize: '.76rem', marginTop: 12, color: '#7d858c' }}>
        Plazas calculadas a partir de la memoria descriptiva: «hasta doce reclusos en cada módulo,
        separados en dos celdas» — dos módulos de celdas enfrentados por tramo.
      </p>
    </div>
  )
}

export default function Sistema() {
  return (
    <div className="wrap">
      <SecHead n="02" titulo="Sistema modular"
        bajada="La unidad mínima, sus piezas y el principio de crecimiento longitudinal." />

      <div className="grid g2" style={{ marginBottom: 52, alignItems: 'start' }}>
        <div>
          <h3 style={{ marginBottom: 10 }}>Unidad mínima</h3>
          <p style={{ fontSize: '.92rem', marginBottom: 22 }}>{MEMORIA.unidadMinima}</p>
          <Ficha titulo="COTAS DEL PLANO">
            <Fila k="Módulo celaduría" v={`${COTAS.celaduriaAncho.valor} × ${COTAS.celaduriaFondo.valor} mm`} f="cota" />
            <Fila k="Módulo celdas" v={`${COTAS.celdasAncho.valor} × ${COTAS.celdasLargo.valor} mm`} f="cota" />
            <Fila k="Ancho patio" v={`${COTAS.patioAncho.valor} mm`} f="cota" />
            <Fila k="Conjunto" v={`${COTAS.celaduriaAncho.valor} × ${COTAS.conjuntoLargo.valor} mm`} f="cota" />
            <Fila k="Altura máxima" v={`${COTAS.alturaMaxima.valor} mm`} f="cota" />
            <Fila k="Altura interior" v={`${COTAS.alturaInterior.valor} mm`} f="cota" />
          </Ficha>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>SECUENCIA DE ENSAMBLAJE</div>
          <Ensamblaje />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 42 }}>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div>
            <h3 style={{ marginBottom: 10 }}>Crecimiento longitudinal</h3>
            <p style={{ fontSize: '.92rem', marginBottom: 24 }}>{MEMORIA.crecimiento}</p>
            <Lamina id="planta" alto={360} />
          </div>
          <Crecimiento />
        </div>
      </div>
    </div>
  )
}
