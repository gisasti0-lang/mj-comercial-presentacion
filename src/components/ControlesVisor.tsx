import { useApp, PRESETS_CORTE } from '../store'
import { CATEGORIAS } from '../three/build'
import { INSTALACIONES, FICHAS, DETALLES } from '../data/project'
import { Src } from './ui'

const VISTAS = [
  { id: 'aerea', l: 'AÉREA' }, { id: 'frontal', l: 'FRONTAL' }, { id: 'lateral', l: 'LATERAL' },
  { id: 'planta', l: 'PLANTA' }, { id: 'corte', l: 'CORTE' },
] as const

export function PanelControl() {
  const s = useApp()
  const anyInst = Object.values(s.instalaciones).some(Boolean)

  return (
    <aside className="ctrl panel">
      <div className="panel-h">MODELO</div>
      <div className="panel-b">
        <div className="eyebrow" style={{ marginBottom: 7 }}>VISIBILIDAD</div>
        {CATEGORIAS.map((c) => (
          <button key={c.id} className={`sw${s.capas[c.id] ? ' on' : ''}`} onClick={() => s.toggleCapa(c.id)}>
            <span className="box" /><span className="lbl">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="panel-sep" />
      <div className="panel-b">
        <div className="eyebrow" style={{ marginBottom: 7 }}>INSTALACIONES</div>
        {INSTALACIONES.map((i) => (
          <button key={i.id}
            className={`sw${s.instalaciones[i.id] ? ' on' : ''}`}
            onClick={() => s.toggleInstalacion(i.id)}
            title={i.nota}>
            <span className="box" />
            <span className="pt" style={{ background: i.color, opacity: s.instalaciones[i.id] ? 1 : .35 }} />
            <span className="lbl" style={{ fontSize: '.58rem' }}>{i.nombre}</span>
          </button>
        ))}
        <button className={`btn${s.modoInstalaciones ? ' on' : ''}`}
          style={{ width: '100%', marginTop: 9 }}
          onClick={() => s.setModoInstalaciones(!s.modoInstalaciones)}>
          MODO INSTALACIONES
        </button>
        {anyInst && (
          <p style={{ fontSize: '.62rem', lineHeight: 1.5, marginTop: 9, color: '#8b9298' }}>
            Sólo se representan las acometidas y el acceso de plomería indicados en la documentación.
            El trazado de las instalaciones está POR DEFINIR.
          </p>
        )}
      </div>

      <div className="panel-sep" />
      <div className="panel-b">
        <div className="eyebrow" style={{ marginBottom: 7 }}>VISTAS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {VISTAS.map((v) => (
            <button key={v.id} className={`btn${s.vista === v.id ? ' on' : ''}`}
              onClick={() => s.setVista(v.id)}>{v.l}</button>
          ))}
        </div>
      </div>

      <div className="panel-sep" />
      <div className="panel-b">
        <div className="eyebrow" style={{ marginBottom: 7 }}>CORTE</div>
        <button className={`sw${s.corte.activo ? ' on' : ''}`} onClick={() => s.setCorte({ activo: !s.corte.activo })}>
          <span className="box" /><span className="lbl">ACTIVAR CORTE</span>
        </button>
        {(['x', 'y', 'z'] as const).map((e) => (
          <div key={e} className="eje">
            <span className="e">{e.toUpperCase()}</span>
            <input className="slider" type="range" min={0} max={1} step={0.005}
              value={s.corte.eje === e ? s.corte.pos : 0.5}
              onChange={(ev) => s.setCorte({ activo: true, eje: e, pos: +ev.target.value })} />
            <span className="v">{s.corte.eje === e ? Math.round(s.corte.pos * 100) : '—'}</span>
          </div>
        ))}
        <button className="btn" style={{ width: '100%', marginTop: 4 }}
          onClick={() => s.setCorte({ invertido: !s.corte.invertido })}>INVERTIR</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 5 }}>
          {PRESETS_CORTE.map((p) => (
            <button key={p.id} className="btn" title={p.desc} onClick={() => s.cortePreset(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-sep" />
      <div className="panel-b">
        <div className="eyebrow" style={{ marginBottom: 7 }}>CRECIMIENTO</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className={`btn${s.tramos === n ? ' on' : ''}`} style={{ flex: 1, padding: '8px 0' }}
              onClick={() => s.setTramos(n)}>{n}</button>
          ))}
        </div>
        <div className="cota" style={{ marginTop: 7 }}>{3000 + 12000 * s.tramos} mm · {24 * s.tramos} plazas</div>
      </div>

      <div className="panel-sep" />
      <div className="panel-b" style={{ display: 'grid', gap: 5 }}>
        <button className={`btn btn-l${s.explotado ? ' on' : ''}`} onClick={() => s.setExplotado(!s.explotado)}>
          EXPLODED VIEW
        </button>
        <button className="btn btn-l" onClick={s.reset}>RESET</button>
      </div>
    </aside>
  )
}

export function PanelInfo() {
  const sel = useApp((s) => s.seleccion)
  const abrirDoc = useApp((s) => s.abrirDoc)
  const irA = useApp((s) => s.irA)
  const setModuloActivo = useApp((s) => s.setModuloActivo)
  const seleccionar = useApp((s) => s.seleccionar)

  if (!sel) {
    return (
      <div className="info panel">
        <div className="panel-b">
          <div className="eyebrow">SELECCIÓN</div>
          <p style={{ fontSize: '.76rem', marginTop: 7, color: '#7d858c' }}>
            Hacé click sobre cualquier elemento del modelo para ver su información técnica y su vínculo
            con el plano.
          </p>
        </div>
      </div>
    )
  }

  const ficha = FICHAS.find((f) => f.id === sel.ficha)
  const det = DETALLES.find((d) => d.id === sel.detalle)

  return (
    <div className="info panel">
      <div className="panel-h" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{sel.categoria}</span>
        <button onClick={() => seleccionar(null)} style={{ color: '#7d858c' }}>✕</button>
      </div>
      <div className="panel-b">
        <h3 style={{ fontSize: '.92rem', marginBottom: 4 }}>{sel.nombre}</h3>
        {ficha?.perfil && <div className="cota" style={{ marginBottom: 8 }}>{ficha.tipo} {ficha.perfil}</div>}
        {ficha?.espesor && !ficha.perfil && <div className="cota" style={{ marginBottom: 8 }}>{ficha.espesor}</div>}

        {sel.origen && <div style={{ margin: '8px 0' }}><Src f={sel.origen} /></div>}
        {sel.cota && (
          <p style={{ fontSize: '.72rem', lineHeight: 1.55, color: '#9aa2a9', marginTop: 6 }}>{sel.cota}</p>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {det && <button className="btn" onClick={() => abrirDoc(det.doc)}>DETALLE {det.codigo} →</button>}
          <button className="btn" onClick={() => { setModuloActivo(sel.modulo ?? null); irA(3) }}>
            VER EN PLANTA
          </button>
        </div>
      </div>
    </div>
  )
}

export function Modos() {
  const modo = useApp((s) => s.modo)
  const setModo = useApp((s) => s.setModo)
  return (
    <div className="modos">
      <button className={`btn${modo === 'presentacion' ? ' on' : ''}`} onClick={() => setModo('presentacion')}>
        PRESENTATION
      </button>
      <button className={`btn${modo === 'tecnico' ? ' on' : ''}`} onClick={() => setModo('tecnico')}>
        TECHNICAL
      </button>
    </div>
  )
}

export function Brujula() {
  return (
    <div className="brujula" title="Orientación relativa del modelo">
      <div style={{ textAlign: 'center', lineHeight: 1.35 }}>
        <div className="n">▲ N</div>
        <div style={{ fontSize: '.48rem', letterSpacing: '.1em' }}>CELADURÍA</div>
      </div>
    </div>
  )
}
