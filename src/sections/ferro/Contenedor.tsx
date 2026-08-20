import { SecHead, Ficha, Fila, Lamina, Aviso } from '../../components/ui'
import { CG35, CG35_COTAS, CG35_VARIANTES } from '../../data/ferrocarriles'
import VisorCG35 from '../../three/VisorCG35'
import { CATS_CG35 } from '../../three/contenedor'
import { useFerro } from '../../storeFerro'
import ControlCorte from '../../components/ControlCorte'

export default function Contenedor() {
  const f = useFerro()
  return (
    <div className="wrap-ancho">
      <SecHead n="04" titulo="Contenedor granero 35 m³"
        bajada={`Plano ${CG35.plano} — ${CG35.lamina}, escala ${CG35.escala}, trocha ${CG35.trocha}, emisión ${CG35.emision}.`} />

      {/* Modelo tridimensional del contenedor */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '1px solid var(--linea)', background: '#0e1114', marginBottom: 12 }}>
        <VisorCG35 />
        <div style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none' }}>
          <div className="cota" style={{ fontSize: '.7rem' }}>CONTENEDOR GRANERO 35 m³ — CG35</div>
          <div className="mono" style={{ fontSize: '.58rem', color: 'var(--hormigon)', marginTop: 3 }}>
            6000 × 2590 × 2868 MM · TOLVAS A 32° · 3 BOCAS DE DESCARGA
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {CATS_CG35.map((c) => (
          <button key={c.id} className={`btn${f.capasCG[c.id] ? ' on' : ''}`}
            onClick={() => f.toggleCapaCG(c.id)}>{c.label}</button>
        ))}
        <button className={`btn${f.explotadoCG ? ' on' : ''}`}
          onClick={() => f.setExplotadoCG(!f.explotadoCG)}>EXPLODED VIEW</button>
      </div>
      <div style={{ marginBottom: 12 }}><ControlCorte /></div>
      {f.seleccionCG && (
        <div className="ficha" style={{ marginBottom: 22 }}>
          <div className="ficha-h">
            <span className="t">{f.seleccionCG.categoria}</span>
            <button onClick={() => f.seleccionarCG(null)} style={{ color: '#7d858c' }}>✕</button>
          </div>
          <div className="ficha-b">
            <h3 style={{ fontSize: '.9rem' }}>{f.seleccionCG.nombre}</h3>
            {f.seleccionCG.espec && <p style={{ fontSize: '.76rem', marginTop: 8 }}>{f.seleccionCG.espec}</p>}
          </div>
        </div>
      )}

      <div className="grid g2" style={{ alignItems: 'start', marginBottom: 30 }}>
        {CG35_VARIANTES.map((v) => (
          <div className="card" key={v.id}>
            <div className="n">PROPUESTA</div>
            <h3 style={{ marginTop: 8 }}>{v.titulo}</h3>
            <div style={{ display: 'flex', gap: 26, margin: '16px 0 12px' }}>
              <div>
                <div className="cota" style={{ fontSize: '1.5rem' }}>{v.volumen}</div>
                <div className="eyebrow" style={{ marginTop: 3 }}>VOLUMEN</div>
              </div>
              <div>
                <div className="cota" style={{ fontSize: '1.5rem' }}>{v.carga}</div>
                <div className="eyebrow" style={{ marginTop: 3 }}>CARGA</div>
              </div>
            </div>
            <div className="fila"><span className="k">Ancho</span><span className="v">{v.ancho}</span></div>
            <div className="fila"><span className="k">Alto</span>
              <span className="v" style={{ color: v.alto === 'POR DEFINIR' ? '#d08a7a' : undefined }}>{v.alto}</span></div>
            <p style={{ marginTop: 12, fontSize: '.79rem' }}>{v.nota}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px,.36fr)', gap: 26, alignItems: 'start' }}>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <Lamina id="cg35-elev-lat" />
          <Lamina id="cg35-elev-front" />
          <Lamina id="cg35-corte-aa" />
          <Lamina id="cg35-corte-bb" />
        </div>

        <aside style={{ position: 'sticky', top: 20, display: 'grid', gap: 16 }}>
          <Ficha titulo="COTAS DEL PLANO" extra={<span className="cota">mm</span>}>
            {CG35_COTAS.map((c) => <Fila key={c.k} k={c.k} v={c.v} f={c.fuente} />)}
          </Ficha>
          <Aviso titulo="GÁLIBO">
            La propuesta sobre medida aprovecha el gálibo de trocha angosta para ganar volumen
            respecto del contenedor ISO 20′. El peso propio del contenedor no figura en la
            documentación entregada.
          </Aviso>
        </aside>
      </div>

      <div style={{ marginTop: 30 }}>
        <Lamina id="cg35-galibo" />
      </div>
    </div>
  )
}
