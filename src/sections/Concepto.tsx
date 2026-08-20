import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SecHead, Lamina, Aviso } from '../components/ui'
import { MEMORIA } from '../data/project'

const CONCEPTOS = [
  { n: '01', t: 'MODULARIDAD', d: 'Repetición y combinación de unidades. El conjunto se compone de módulos de celaduría, de celdas y de patio/corredor.' },
  { n: '02', t: 'ESTRUCTURA', d: 'Sistema constructivo basado en elementos metálicos: parantes de tubo, perfilería C y cerramientos de chapa.' },
  { n: '03', t: 'ORGANIZACIÓN', d: 'Configuración de los módulos de celdas enfrentados alrededor de un corredor central que funciona además como patio.' },
]

/* Diagrama: aparece una unidad y luego se incorporan los módulos sucesivos */
function DiagramaAparicion() {
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setPaso((p) => (p + 1) % 5), 1100)
    return () => clearInterval(id)
  }, [])

  const piezas = [
    { x: 0, y: 0, w: 90, h: 30, l: 'CELADURÍA' },
    { x: 0, y: 30, w: 30, h: 120, l: 'CELDAS' },
    { x: 60, y: 30, w: 30, h: 120, l: 'CELDAS' },
    { x: 30, y: 30, w: 30, h: 120, l: 'PATIO' },
  ]

  return (
    <svg viewBox="-14 -14 118 178" style={{ width: '100%', maxWidth: 300 }}>
      {piezas.map((p, i) => (
        <motion.g key={i}
          initial={false}
          animate={{ opacity: paso > i ? 1 : 0.07, y: paso > i ? 0 : -7 }}
          transition={{ duration: .5, ease: [.16, 1, .3, 1] }}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h}
            fill={i === 3 ? 'rgba(255,138,30,.14)' : 'rgba(255,255,255,.04)'}
            stroke={paso > i ? '#ff8a1e' : '#3a424c'} strokeWidth={0.9} />
          <text x={p.x + p.w / 2} y={p.y + p.h / 2}
            fill="#8b9298" fontFamily="var(--mono)" fontSize={4.6} textAnchor="middle"
            transform={p.h > p.w ? `rotate(-90 ${p.x + p.w / 2} ${p.y + p.h / 2})` : undefined}>
            {p.l}
          </text>
        </motion.g>
      ))}
      <text x={45} y={-5} fill="#f0b323" fontFamily="var(--mono)" fontSize={4.4} textAnchor="middle">9000</text>
      <text x={-6} y={90} fill="#f0b323" fontFamily="var(--mono)" fontSize={4.4} textAnchor="middle"
        transform="rotate(-90 -6 90)">15000</text>
    </svg>
  )
}

export default function Concepto() {
  return (
    <div className="wrap">
      <SecHead n="01" titulo="Concepto"
        bajada="La idea principal del sistema, según la memoria descriptiva del proyecto." />

      <div className="grid g2" style={{ alignItems: 'center', marginBottom: 46 }}>
        <div>
          <p style={{ fontSize: '1.04rem', lineHeight: 1.68, color: '#cfd6dc' }}>
            El proyecto se organiza mediante un sistema de módulos repetibles que permite configurar
            el conjunto y posibilitar su crecimiento longitudinal.
          </p>
          <p style={{ marginTop: 20, fontSize: '.9rem' }}>{MEMORIA.origen}</p>
        </div>
        <div style={{ display: 'grid', placeItems: 'center' }}><DiagramaAparicion /></div>
      </div>

      <div className="grid g3" style={{ marginBottom: 46 }}>
        {CONCEPTOS.map((c) => (
          <div className="card" key={c.n}>
            <div className="n">{c.n}</div>
            <h3>{c.t}</h3>
            <p>{c.d}</p>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Lamina id="iso-celaduria" />
        <div>
          <Aviso titulo="MEMORIA DESCRIPTIVA">{MEMORIA.unidadMinima}</Aviso>
          <div style={{ height: 14 }} />
          <Aviso titulo="CRECIMIENTO">{MEMORIA.crecimiento}</Aviso>
        </div>
      </div>
    </div>
  )
}
