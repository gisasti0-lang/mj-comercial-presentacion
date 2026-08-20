import VisorVagon from '../../three/VisorVagon'
import { CATS_VAGON } from '../../three/vagon'
import { useFerro } from '../../storeFerro'
import { VAGONES_3D, FABRICADOS, PLANTA, TROCHAS } from '../../data/ferrocarriles'
import { Src } from '../../components/ui'
import ControlCorte from '../../components/ControlCorte'
import { ruta } from '../../data/ruta'

export default function Vagones() {
  const s = useFerro()
  const v = VAGONES_3D.find((x) => x.id === s.vagon) ?? VAGONES_3D[0]

  return (
    <div className="pane">
      <div className="wrap-ancho">
        <header className="sec-head">
          <div className="idx">01</div>
          <div className="tit">
            <h2>Vagones de carga</h2>
            <p>Siete tipos acotados. El modelo se genera con las cotas declaradas de cada vagón
              y monta el bogie 1676 documentado a la separación indicada.</p>
          </div>
        </header>

        {/* selector de tipo */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {VAGONES_3D.map((x) => (
            <button key={x.id} className={`btn${s.vagon === x.id ? ' on' : ''}`}
              onClick={() => s.setVagon(x.id)}>{x.nombre.replace('Vagón ', '')}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,.38fr)', gap: 22, alignItems: 'start' }}>
          <div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', border: '1px solid var(--linea)', background: '#0e1114' }}>
              <VisorVagon />
              <div style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none' }}>
                <div className="cota" style={{ fontSize: '.7rem' }}>{v.nombre.toUpperCase()}</div>
                <div className="mono" style={{ fontSize: '.58rem', color: 'var(--hormigon)', marginTop: 3 }}>
                  {v.entreCabezales} × {v.ancho} × {v.alto} MM · TROCHA {v.trocha}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {CATS_VAGON.map((c) => (
                <button key={c.id} className={`btn${s.capasVagon[c.id] ? ' on' : ''}`}
                  onClick={() => s.toggleCapaVagon(c.id)}>{c.label}</button>
              ))}
              <button className={`btn${s.explotadoVagon ? ' on' : ''}`}
                onClick={() => s.setExplotadoVagon(!s.explotadoVagon)}>EXPLODED VIEW</button>
            </div>
            <div style={{ marginBottom: 12 }}><ControlCorte /></div>

            {s.seleccionVagon && (
              <div className="ficha" style={{ marginTop: 12 }}>
                <div className="ficha-h">
                  <span className="t">{s.seleccionVagon.categoria}</span>
                  <button onClick={() => s.seleccionarVagon(null)} style={{ color: '#7d858c' }}>✕</button>
                </div>
                <div className="ficha-b">
                  <h3 style={{ fontSize: '.88rem' }}>{s.seleccionVagon.nombre}</h3>
                  {s.seleccionVagon.espec && (
                    <p style={{ fontSize: '.76rem', marginTop: 7 }}>{s.seleccionVagon.espec}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid g2" style={{ marginTop: 24, alignItems: 'start' }}>
              <figure>
                <div className="lamina"><img src={ruta(v.imagen)} alt={v.nombre} /></div>
                <figcaption className="lamina-cap"><span>{v.nombre.toUpperCase()}</span></figcaption>
              </figure>
              <div>
                <p style={{ fontSize: '.88rem', marginBottom: 14 }}>{v.desc}</p>
                {v.detalles.map((d) => (
                  <div key={d} style={{ display: 'flex', gap: 9, padding: '5px 0', fontSize: '.79rem', color: '#9aa2a9' }}>
                    <span style={{ color: 'var(--acento)' }}>·</span>{d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside style={{ position: 'sticky', top: 16, display: 'grid', gap: 14 }}>
            <div className="ficha">
              <div className="ficha-h">
                <span className="t">COTAS DECLARADAS</span>
                <Src f="cota" />
              </div>
              <div className="ficha-b">
                {v.cotas.map((c) => (
                  <div className="fila" key={c.k}>
                    <span className="k">{c.k}</span><span className="v">{c.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ficha">
              <div className="ficha-h"><span className="t">TROCHAS DE BOGIE</span></div>
              <div className="ficha-b">
                {TROCHAS.map((t) => (
                  <div className="fila" key={t.mm}>
                    <span className="k">{t.label}</span>
                    <span className="v" style={{ color: t.mm === v.trocha ? 'var(--acento)' : undefined }}>{t.mm} mm</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="aviso">
              <div className="t">SOBRE EL MODELO</div>
              La caja, el bastidor y la separación entre bogies usan las cotas declaradas de cada
              tipo. La altura de plataforma (1208 mm) es la única cota vertical de bastidor que
              consta en la documentación —del vagón portacontenedor— y se toma como referencia
              para toda la familia.
            </div>
          </aside>
        </div>

        <div style={{ borderTop: '1px solid var(--linea)', marginTop: 40, paddingTop: 34 }}>
          <div className="grid g2" style={{ alignItems: 'start' }}>
            <div>
              <h3 style={{ marginBottom: 14 }}>Tipo y cantidad aproximada de vagones fabricados</h3>
              <div style={{ border: '1px solid var(--linea)', background: '#101317' }}>
                {FABRICADOS.map((f, i) => (
                  <div key={f.t} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '9px 15px',
                    borderTop: i ? '1px solid var(--linea-2)' : 'none',
                  }}>
                    <span style={{ flex: 1, fontSize: '.8rem' }}>{f.t}</span>
                    <div style={{ width: 110, height: 4, background: '#20262c' }}>
                      <div style={{ width: `${(f.n / 2000) * 100}%`, height: '100%', background: 'var(--acento)' }} />
                    </div>
                    <span className="cota" style={{ width: 48, textAlign: 'right' }}>{f.n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: 14 }}>Planta industrial</h3>
              <div className="grid g2" style={{ gap: 12 }}>
                {PLANTA.map((p) => (
                  <div className="ficha" key={p.k}>
                    <div className="ficha-b">
                      <div className="cota" style={{ fontSize: '1.3rem', color: 'var(--acento)' }}>{p.v}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--tenue)', marginTop: 5 }}>{p.k}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
