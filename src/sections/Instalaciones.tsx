import { SecHead, Lamina, Aviso, Ficha, Src } from '../components/ui'
import { INSTALACIONES, MEMORIA, PUNTOS_DOC } from '../data/project'
import { useApp } from '../store'
import { DOCUMENTOS } from '../data/documentos'

const W = 9000, CEL = 3000, TRAMO = 12000

function PlantaInstalaciones() {
  const activas = useApp((s) => s.instalaciones)
  const tramos = useApp((s) => s.tramos)
  const L = CEL + TRAMO * tramos
  const algo = Object.values(activas).some(Boolean)

  return (
    <svg viewBox={`-1600 -1400 ${W + 3200} ${L + 3000}`} style={{ width: '100%', maxHeight: '62vh' }}>
      {/* arquitectura de base */}
      <g opacity={algo ? .34 : 1}>
        <rect x={0} y={0} width={W} height={L} fill="rgba(255,255,255,.02)" stroke="#4a525c" strokeWidth={26} />
        <line x1={0} y1={CEL} x2={W} y2={CEL} stroke="#4a525c" strokeWidth={22} />
        <line x1={3000} y1={CEL} x2={3000} y2={L} stroke="#4a525c" strokeWidth={22} />
        <line x1={6000} y1={CEL} x2={6000} y2={L} stroke="#4a525c" strokeWidth={22} />
        {Array.from({ length: tramos }).map((_, k) => (
          <line key={k} x1={0} y1={9000 + k * TRAMO} x2={W} y2={9000 + k * TRAMO} stroke="#4a525c" strokeWidth={16} />
        ))}
        <text x={W / 2} y={CEL / 2} fill="#6c7278" fontFamily="var(--mono)" fontSize={150} textAnchor="middle">CELADURÍA</text>
        <text x={4500} y={L / 2} fill="#6c7278" fontFamily="var(--mono)" fontSize={150} textAnchor="middle"
          transform={`rotate(-90 4500 ${L / 2})`}>PATIO / CORREDOR</text>
      </g>

      {/* acometidas documentadas — parte trasera del módulo */}
      {(activas.electrica || activas['agua-fria'] || activas.cloacal) && (
        <g>
          <rect x={3200} y={L + 130} width={2600} height={520} fill="rgba(255,138,30,.1)" stroke="#ff8a1e"
            strokeWidth={22} strokeDasharray="120 70" />
          <text x={4500} y={L + 460} fill="#ff8a1e" fontFamily="var(--mono)" fontSize={150} textAnchor="middle">
            ACOMETIDAS
          </text>
          <text x={4500} y={L + 900} fill="#8b9298" fontFamily="var(--mono)" fontSize={126} textAnchor="middle">
            ELECTRICIDAD · AGUA FRÍA · CLOACA — POSICIÓN NO ACOTADA
          </text>
        </g>
      )}

      {/* acceso plomería — indicado en el isométrico */}
      {(activas['agua-fria'] || activas.cloacal) && Array.from({ length: tramos }).map((_, k) => (
        <g key={k}>
          {[0, W].map((x) => (
            <g key={x}>
              <rect x={x === 0 ? -260 : W - 40} y={9000 + k * TRAMO - 700} width={300} height={1400}
                fill="rgba(74,159,216,.18)" stroke="#4a9fd8" strokeWidth={26} />
            </g>
          ))}
          <text x={-500} y={9000 + k * TRAMO - 900} fill="#4a9fd8" fontFamily="var(--mono)" fontSize={126}>
            ACCESO PLOMERÍA
          </text>
        </g>
      ))}

      {/* capas sin documentación */}
      {(activas.pluvial || activas['agua-caliente'] || activas.ventilacion) && (
        <g>
          <rect x={600} y={L / 2 - 700} width={W - 1200} height={1400} fill="rgba(208,138,122,.07)"
            stroke="#d08a7a" strokeWidth={22} strokeDasharray="150 90" />
          <text x={W / 2} y={L / 2 - 60} fill="#d08a7a" fontFamily="var(--mono)" fontSize={190} textAnchor="middle">
            POR DEFINIR
          </text>
          <text x={W / 2} y={L / 2 + 340} fill="#8b9298" fontFamily="var(--mono)" fontSize={126} textAnchor="middle">
            SIN TRAZADO EN LA DOCUMENTACIÓN ENTREGADA
          </text>
        </g>
      )}

      {!algo && (
        <text x={W / 2} y={-700} fill="#6c7278" fontFamily="var(--mono)" fontSize={150} textAnchor="middle">
          ACTIVÁ UNA CAPA PARA SUPERPONERLA A LA ARQUITECTURA
        </text>
      )}
    </svg>
  )
}

export default function Instalaciones() {
  const s = useApp()
  const docsInst = DOCUMENTOS.filter((d) => d.categoria === 'INSTALACIONES')

  return (
    <div className="wrap-ancho">
      <SecHead n="05" titulo="Instalaciones"
        bajada="Capas de instalaciones sobre la arquitectura. Se representa únicamente lo que consta en la documentación." />

      <div style={{ marginBottom: 28 }}>
        <Aviso titulo="ESTADO DE LA DOCUMENTACIÓN">
          La documentación entregada <strong>no incluye planos de instalaciones</strong>. Lo único documentado
          son las acometidas —«{MEMORIA.acometidas}»— y el punto de <span className="mono">ACCESO PLOMERÍA</span> señalado
          en el isométrico de la lámina. En consecuencia, este visor mantiene el sistema de capas
          operativo pero <strong>no dibuja trazados que no existan en el plano</strong>: las capas sin
          documentación se muestran como <span className="mono" style={{ color: 'var(--acento)' }}>POR DEFINIR</span>.
        </Aviso>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,.42fr) minmax(0,1fr)', gap: 26, alignItems: 'start' }}>
        <div>
          <div className="ficha">
            <div className="ficha-h"><span className="t">INSTALACIONES</span></div>
            <div className="ficha-b">
              {INSTALACIONES.map((i) => (
                <div key={i.id} style={{ marginBottom: 13 }}>
                  <button className={`sw${s.instalaciones[i.id] ? ' on' : ''}`} onClick={() => s.toggleInstalacion(i.id)}>
                    <span className="box" />
                    <span className="pt" style={{ background: i.color, opacity: s.instalaciones[i.id] ? 1 : .3 }} />
                    <span className="lbl" style={{ flex: 1 }}>{i.nombre}</span>
                    <Src f={i.estado === 'documentado' ? 'memoria' : 'definir'} />
                  </button>
                  <p style={{ fontSize: '.7rem', color: '#7d858c', paddingLeft: 23, lineHeight: 1.5 }}>{i.nota}</p>
                </div>
              ))}
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                <button className="btn" onClick={() => INSTALACIONES.forEach((i) => s.instalaciones[i.id] && s.toggleInstalacion(i.id))}>
                  OCULTAR TODAS
                </button>
                <button className={`btn${s.modoInstalaciones ? ' on' : ''}`}
                  onClick={() => { s.setModoInstalaciones(!s.modoInstalaciones); }}>
                  MODO INSTALACIONES EN 3D
                </button>
                <button className="btn" onClick={() => s.irA(7)}>ABRIR VISOR 3D →</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Ficha titulo="PUNTOS DOCUMENTADOS EN EL PLANO">
              {PUNTOS_DOC.map((p) => (
                <div className="fila" key={p.id}>
                  <span className="k" style={{ fontSize: '.78rem' }}>{p.nombre}</span>
                  <Src f="cota" />
                </div>
              ))}
            </Ficha>
          </div>
        </div>

        <div style={{ border: '1px solid var(--linea)', background: '#0e1114', padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>PLANTA DE INSTALACIONES — CAPAS SUPERPUESTAS</div>
          <PlantaInstalaciones />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--linea)', marginTop: 44, paddingTop: 38 }}>
        <h3 style={{ marginBottom: 16 }}>Documentación de instalaciones</h3>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div className="grid" style={{ gap: 12 }}>
            {docsInst.map((d) => (
              <div className="ficha" key={d.id}>
                <div className="ficha-h">
                  <span className="t">{d.codigo} · {d.titulo}</span>
                  <Src f="definir" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <Lamina id="iso-celaduria" />
            <p style={{ fontSize: '.74rem', marginTop: 10, color: '#7d858c' }}>
              El isométrico de la lámina señala el <span className="mono">ACCESO PLOMERÍA</span> sobre el muro
              exterior del módulo de celdas, a la altura del tabique que separa las dos celdas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
