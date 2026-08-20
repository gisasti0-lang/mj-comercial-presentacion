import { SecHead, Lamina, Fila, Ficha, Src, Aviso } from '../components/ui'
import { MODULOS, LOCALES, MEMORIA } from '../data/project'
import { useApp } from '../store'

const W = 9000, CEL = 3000, TRAMO = 12000

/* Miniatura esquemática de cada módulo, en planta */
function Mini({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const L = CEL + TRAMO
  return (
    <svg viewBox={`-400 -400 ${W + 800} ${L + 800}`} style={{ width: '100%', maxWidth: 92 }}>
      <rect x={0} y={0} width={W} height={L} fill="none" stroke="#3a424c" strokeWidth={90} />
      <line x1={0} y1={CEL} x2={W} y2={CEL} stroke="#3a424c" strokeWidth={70} />
      <line x1={3000} y1={CEL} x2={3000} y2={L} stroke="#3a424c" strokeWidth={70} />
      <line x1={6000} y1={CEL} x2={6000} y2={L} stroke="#3a424c" strokeWidth={70} />
      <rect x={x0} y={z0} width={x1 - x0} height={Math.min(z1, L) - z0} fill="#ff8a1e" opacity={.62} />
    </svg>
  )
}

const TARJETAS = [
  ...MODULOS.slice(0, 3).map((m, i) => ({ ...m, codigo: String(i + 1).padStart(2, '0') })),
  { id: 'bano', codigo: '04', nombre: 'BAÑO CELADURÍA', x: [LOCALES[0].x[0], LOCALES[0].x[1]] as [number, number], z: [0, CEL] as [number, number],
    texto: 'Local del módulo de celaduría indicado en planta. El plano no acota sus dimensiones interiores.',
    datos: [{ k: 'Ubicación', v: 'Módulo de celaduría', fuente: 'cota' as const }], doc: 'planta' },
  { id: 'duchas', codigo: '05', nombre: 'DUCHAS', x: [LOCALES[2].x[0], LOCALES[2].x[1]] as [number, number], z: [0, CEL] as [number, number],
    texto: 'Sector de duchas indicado en planta dentro del módulo de celaduría.',
    datos: [{ k: 'Ubicación', v: 'Módulo de celaduría', fuente: 'cota' as const }], doc: 'planta' },
  { id: 'celaduria-local', codigo: '06', nombre: 'CELADURÍA — CONTROL', x: [LOCALES[1].x[0], LOCALES[1].x[1]] as [number, number], z: [0, CEL] as [number, number],
    texto: 'Local de celaduría: es el punto de control del conjunto y el que da nombre al módulo. El ingreso se produce por este extremo.',
    datos: [{ k: 'Ubicación', v: 'Módulo de celaduría', fuente: 'cota' as const }], doc: 'iso-celaduria' },
]

export default function Modulos() {
  const s = useApp()
  const L = CEL + TRAMO * s.tramos

  return (
    <div className="wrap">
      <SecHead n="04" titulo="Módulos"
        bajada="Los módulos y locales indicados en la planta del anteproyecto." />

      <div className="grid g3" style={{ marginBottom: 44 }}>
        {TARJETAS.map((t) => (
          <div className="card" key={t.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div className="n">{t.codigo}</div>
                <h3>{t.nombre}</h3>
              </div>
              <Mini x0={t.x[0]} x1={t.x[1]} z0={t.z[0]} z1={t.z[1]} />
            </div>
            <p style={{ marginTop: 6 }}>{t.texto}</p>
            <div style={{ marginTop: 14 }}>
              {t.datos.slice(0, 3).map((d) => (
                <div className="fila" key={d.k}>
                  <span className="k" style={{ fontSize: '.78rem' }}>{d.k}</span>
                  <span className="v" style={{ fontSize: '.72rem' }}>{d.v}</span>
                </div>
              ))}
            </div>
            <button className="btn" style={{ width: '100%', marginTop: 15 }}
              onClick={() => {
                s.enfocar({
                  x: ((t.x[0] + t.x[1]) / 2 - W / 2) / 1000, y: 1.2,
                  z: (Math.min((t.z[0] + t.z[1]) / 2, L) - L / 2) / 1000,
                  dist: 8,
                })
                s.setModuloActivo(t.id)
                s.irA(7)
              }}>
              EXPLORAR →
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 40 }}>
        <h3 style={{ marginBottom: 8 }}>Vistas del proyecto</h3>
        <p style={{ fontSize: '.88rem', marginBottom: 22 }}>
          Las únicas vistas volumétricas incluidas en la documentación son los dos isométricos de la
          lámina. Las vistas interiores se obtienen del modelo tridimensional, construido con las cotas
          del plano.
        </p>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <Lamina id="iso-celaduria" />
          <Lamina id="iso-porton" />
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <Ficha titulo="CAPACIDAD" extra={<Src f="memoria" />}>
            <Fila k="Por módulo de celdas" v="hasta 12 reclusos" f="memoria" />
            <Fila k="Celdas por módulo" v="2" f="memoria" />
            <Fila k="Módulos por tramo" v="2 enfrentados" f="cota" />
            <Fila k="Plazas por tramo" v="24" />
            <Fila k="Equipamiento" v="Camas cuchetas y sanitario amurados" f="memoria" />
            <p style={{ fontSize: '.72rem', marginTop: 12, color: '#7d858c' }}>
              La cantidad y disposición de cuchetas del modelo sigue las seis posiciones dibujadas en
              la planta por módulo. El plano no las acota.
            </p>
          </Ficha>
          <div>
            <Aviso titulo="PATIO / CORREDOR">{MEMORIA.patio}</Aviso>
            <div style={{ height: 14 }} />
            <Aviso titulo="LOCALES NO PRESENTES EN LA DOCUMENTACIÓN">
              La planta entregada indica únicamente baño de celaduría, celaduría, duchas, módulos de
              celdas y patio/corredor. No figuran comedor ni oficina de control como locales
              independientes — quedan <span className="mono" style={{ color: 'var(--acento)' }}>POR DEFINIR</span>.
              El patio/corredor cumple la función de espacio común según la memoria.
            </Aviso>
          </div>
        </div>
      </div>
    </div>
  )
}
