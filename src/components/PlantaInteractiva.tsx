import { useApp } from '../store'
import { MODULOS, MEDIDO, LOCALES } from '../data/project'

const W = 9000, CEL = 3000, TRAMO = 12000, T = 120

interface Zona { id: string; nombre: string; x: number; y: number; w: number; h: number; vert?: boolean }

export default function PlantaInteractiva({ compacta = false }: { compacta?: boolean }) {
  const tramos = useApp((s) => s.tramos)
  const activo = useApp((s) => s.moduloActivo)
  const setActivo = useApp((s) => s.setModuloActivo)
  const L = CEL + TRAMO * tramos

  const zonas: Zona[] = [
    ...LOCALES.map((l) => ({ id: l.id, nombre: l.nombre, x: l.x[0], y: l.z[0], w: l.x[1] - l.x[0], h: l.z[1] - l.z[0] })),
    { id: 'celdas-a', nombre: 'MÓDULO CELDAS', x: T, y: CEL + T, w: 3000 - 2 * T, h: L - CEL - 2 * T, vert: true },
    { id: 'patio', nombre: 'PATIO / CORREDOR', x: 3000 + T, y: CEL + T, w: 3000 - 2 * T, h: L - CEL - 2 * T, vert: true },
    { id: 'celdas-b', nombre: 'MÓDULO CELDAS', x: 6000 + T, y: CEL + T, w: 3000 - 2 * T, h: L - CEL - 2 * T, vert: true },
  ]

  const camas: { x: number; y: number }[] = []
  for (let k = 0; k < tramos; k++) {
    for (const cz of MEDIDO.celdas.camaZ) {
      camas.push({ x: T + 60, y: cz + k * TRAMO - MEDIDO.celdas.camaAncho / 2 })
      camas.push({ x: W - T - 60 - MEDIDO.celdas.camaLargo, y: cz + k * TRAMO - MEDIDO.celdas.camaAncho / 2 })
    }
  }

  const M = 1500
  return (
    <svg className="planta-svg" viewBox={`${-M} ${-M} ${W + 2 * M} ${L + 2 * M}`}
      style={compacta ? { maxHeight: '68vh' } : undefined}>
      {/* muro perimetral */}
      <rect x={0} y={0} width={W} height={L} fill="rgba(255,255,255,.02)" stroke="#4a525c" strokeWidth={26} />

      {/* zonas interactivas */}
      {zonas.map((z) => {
        const cx = z.x + z.w / 2, cy = z.y + z.h / 2
        const on = activo === z.id
        return (
          <g key={z.id} className={`zona${on ? ' on' : ''}`} onClick={() => setActivo(on ? null : z.id)}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} />
            <text x={cx} y={cy} transform={z.vert ? `rotate(-90 ${cx} ${cy})` : undefined}>
              {z.nombre}
            </text>
          </g>
        )
      })}

      {/* tabiques entre celdas + camas */}
      {Array.from({ length: tramos }).map((_, k) => (
        <g key={k}>
          {[0, 6000].map((x0) => (
            <rect key={x0} x={x0 + T} y={MEDIDO.celdas.tabiqueEnZ + k * TRAMO - T / 2}
              width={3000 - 2 * T} height={T} fill="#4a525c" />
          ))}
        </g>
      ))}
      {camas.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={MEDIDO.celdas.camaLargo} height={MEDIDO.celdas.camaAncho}
          fill="none" stroke="#5c6570" strokeWidth={14} />
      ))}

      {/* portón final */}
      <rect x={3000 + T} y={L - 90} width={3000 - 2 * T} height={70} fill="#ff8a1e" opacity={0.55} />

      {/* cotas */}
      <g>
        <line className="cota-l" x1={0} y1={-620} x2={3000} y2={-620} />
        <line className="cota-l" x1={3000} y1={-620} x2={6000} y2={-620} />
        <line className="cota-l" x1={6000} y1={-620} x2={9000} y2={-620} />
        <text className="cota-t" x={1500} y={-720}>3000</text>
        <text className="cota-t" x={4500} y={-720}>3000</text>
        <text className="cota-t" x={7500} y={-720}>3000</text>
        <text className="cota-t" x={4500} y={-1010} style={{ fontSize: 150 }}>9000</text>

        <line className="cota-l" x1={-620} y1={0} x2={-620} y2={CEL} />
        <line className="cota-l" x1={-620} y1={CEL} x2={-620} y2={L} />
        <text className="cota-t" x={-760} y={CEL / 2} transform={`rotate(-90 -760 ${CEL / 2})`}>3000</text>
        <text className="cota-t" x={-760} y={(CEL + L) / 2} transform={`rotate(-90 -760 ${(CEL + L) / 2})`}>
          {TRAMO * tramos}
        </text>
        <text className="cota-t" x={-1080} y={L / 2} transform={`rotate(-90 -1080 ${L / 2})`}
          style={{ fontSize: 150 }}>{L}</text>
      </g>

      {/* crecimiento */}
      <text className="cota-t" x={W / 2} y={L + 560} style={{ fill: '#8b9298', fontSize: 132 }}>
        POSIBILIDAD DE CRECIMIENTO EN ESTE SENTIDO
      </text>
      {[2000, 4500, 7000].map((x) => (
        <path key={x} d={`M${x} ${L + 680} L${x} ${L + 900} M${x - 70} ${L + 830} L${x} ${L + 900} L${x + 70} ${L + 830}`}
          stroke="#8b9298" strokeWidth={16} fill="none" />
      ))}

      {/* referencias documentadas */}
      <g fontFamily="var(--mono)" fontSize={112} fill="#ff8a1e">
        <circle cx={6150} cy={0} r={60} /><text x={6280} y={-60}>INGRESO CELADURÍA</text>
        <circle cx={4500} cy={L} r={60} /><text x={4640} y={L + 150}>PORTÓN FINAL</text>
        {Array.from({ length: tramos }).map((_, k) => (
          <g key={k}>
            <circle cx={0} cy={MEDIDO.celdas.puertaZ + k * TRAMO} r={60} />
            <text x={-1400} y={MEDIDO.celdas.puertaZ + k * TRAMO - 90}>ACCESO PLOMERÍA</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

export function PanelZona() {
  const activo = useApp((s) => s.moduloActivo)
  const irA = useApp((s) => s.irA)
  const enfocar = useApp((s) => s.enfocar)
  const abrirDoc = useApp((s) => s.abrirDoc)
  const tramos = useApp((s) => s.tramos)
  if (!activo) return null

  const L = CEL + TRAMO * tramos
  const mod = MODULOS.find((m) => m.id === activo)
  const loc = LOCALES.find((l) => l.id === activo)
  const nombre = mod?.nombre ?? loc?.nombre ?? ''
  const x = mod ? (mod.x[0] + mod.x[1]) / 2 : loc ? (loc.x[0] + loc.x[1]) / 2 : W / 2
  const z = mod ? Math.min((mod.z[0] + mod.z[1]) / 2, L / 2) : loc ? (loc.z[0] + loc.z[1]) / 2 : L / 2

  const ver3D = () => {
    enfocar({ x: (x - W / 2) / 1000, y: 1.2, z: (z - L / 2) / 1000, dist: mod?.id === 'patio' ? 9 : 7 })
    irA(7)
  }

  return (
    <div className="ficha" style={{ marginTop: 18 }}>
      <div className="ficha-h">
        <span className="t">{nombre}</span>
        <span className="cota">{mod ? `${mod.x[1] - mod.x[0]} × ${Math.min(mod.z[1], L) - mod.z[0]} mm` : ''}</span>
      </div>
      <div className="ficha-b">
        {mod && <p style={{ fontSize: '.85rem', marginBottom: 14 }}>{mod.texto}</p>}
        {mod?.datos.map((d) => (
          <div className="fila" key={d.k}>
            <span className="k">{d.k}</span>
            <span className="v">{d.v}</span>
          </div>
        ))}
        {loc && <p style={{ fontSize: '.85rem' }}>
          Local del módulo de celaduría indicado en planta. Dimensiones interiores medidas sobre el plano —
          el plano no las acota individualmente.
        </p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-l" onClick={ver3D}>VER EN 3D →</button>
          <button className="btn btn-l" onClick={() => abrirDoc(mod?.doc ?? 'planta')}>VER DETALLE</button>
        </div>
      </div>
    </div>
  )
}
