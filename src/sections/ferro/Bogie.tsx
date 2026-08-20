import { SecHead, Ficha, Fila, Aviso, Src } from '../../components/ui'
import {
  BOGIE, BOGIE_COTAS, BOGIE_SISTEMAS, BOGIE_COMPONENTES, BOGIE_DISCREPANCIA,
  BOGIE_NORMAS_REF, BOGIE_ESPECIFICACIONES,
} from '../../data/ferrocarriles'
import VisorBogie from '../../three/VisorBogie'
import { CATS_BOGIE } from '../../three/bogie'
import { useFerro } from '../../storeFerro'
import ControlCorte from '../../components/ControlCorte'

export default function Bogie() {
  const f = useFerro()
  return (
    <div className="wrap-ancho">
      <SecHead n="03" titulo="Bogie tipo 1676"
        bajada={`${BOGIE.titulo} — ${BOGIE.subtitulo}`} />

      {/* Modelo tridimensional del bogie */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '1px solid var(--linea)', background: '#0e1114', marginBottom: 12 }}>
        <VisorBogie />
        <div style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none' }}>
          <div className="cota" style={{ fontSize: '.7rem' }}>BOGIE DE CHAPA SOLDADA S.A.B.B.</div>
          <div className="mono" style={{ fontSize: '.58rem', color: 'var(--hormigon)', marginTop: 3 }}>
            TROCHA 1676 · ENTRE EJES 1829 · RUEDA Ø953 MM
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {CATS_BOGIE.map((c) => (
          <button key={c.id} className={`btn${f.capas[c.id] ? ' on' : ''}`}
            onClick={() => f.toggleCapa(c.id)}>{c.label}</button>
        ))}
        <button className={`btn${f.explotado ? ' on' : ''}`}
          onClick={() => f.setExplotado(!f.explotado)}>EXPLODED VIEW</button>
        <button className="btn" onClick={f.reset}>RESET</button>
      </div>
      <div style={{ marginBottom: 12 }}><ControlCorte /></div>
      {f.seleccion && (
        <div className="ficha" style={{ marginBottom: 22 }}>
          <div className="ficha-h">
            <span className="t">{f.seleccion.categoria}</span>
            <button onClick={() => f.seleccionar(null)} style={{ color: '#7d858c' }}>✕</button>
          </div>
          <div className="ficha-b">
            <h3 style={{ fontSize: '.9rem' }}>{f.seleccion.nombre}</h3>
            {f.seleccion.cantidad && <div className="cota" style={{ marginTop: 6 }}>CANTIDAD: {f.seleccion.cantidad}</div>}
            {f.seleccion.espec && <p style={{ fontSize: '.76rem', marginTop: 8 }}>{f.seleccion.espec}</p>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,.42fr)', gap: 28, alignItems: 'start' }}>
        <div>
          <div className="grid g2" style={{ alignItems: 'start', marginBottom: 26 }}>
            <Ficha titulo="DATOS GENERALES">
              <Fila k="Producto" v="Bogie Tipo 1676" />
              <Fila k="Documento" v={BOGIE.documento} />
              <Fila k="Referencia técnica" v={BOGIE.referencia} />
              <Fila k="Norma de diseño y ensayo" v={BOGIE.normaDiseno} />
              <Fila k="Plano de referencia frenos" v={BOGIE.planoFrenos} />
              <Fila k="Fecha" v={BOGIE.fecha} />
            </Ficha>
            <Ficha titulo="COTAS PRINCIPALES" extra={<span className="cota">mm</span>}>
              {BOGIE_COTAS.map((c) => <Fila key={c.k} k={c.k} v={c.v} f={c.fuente} />)}
            </Ficha>
          </div>

          <h3 style={{ marginBottom: 14 }}>Sistemas</h3>
          <div className="grid g2" style={{ marginBottom: 30 }}>
            {BOGIE_SISTEMAS.map((s) => (
              <div className="card" key={s.t}>
                <h3 style={{ fontSize: '.86rem' }}>{s.t}</h3>
                <p style={{ marginTop: 7 }}>{s.d}</p>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 6 }}>Componentes incluidos en el suministro</h3>
          <p style={{ fontSize: '.83rem', marginBottom: 16 }}>Según {BOGIE.documento}.</p>
          <div style={{ border: '1px solid var(--linea)', background: '#101317' }}>
            {BOGIE_COMPONENTES.map((c, i) => (
              <div key={c.n} style={{
                display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) 90px', gap: 14,
                padding: '13px 16px', alignItems: 'start',
                borderTop: i ? '1px solid var(--linea-2)' : 'none',
              }}>
                <span className="num">{String(c.n).padStart(2, '0')}</span>
                <div>
                  <div style={{ fontSize: '.86rem', marginBottom: 4 }}>{c.nombre}</div>
                  {c.espec.map((e) => (
                    <div key={e} className="mono" style={{ fontSize: '.68rem', color: '#8b9298', lineHeight: 1.6 }}>{e}</div>
                  ))}
                </div>
                <span className="cota" style={{ textAlign: 'right' }}>{c.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 20, display: 'grid', gap: 16 }}>
          <div className="ficha" style={{ borderColor: 'rgba(208,138,122,.45)' }}>
            <div className="ficha-h">
              <span className="t" style={{ color: '#d08a7a' }}>DISCREPANCIA ENTRE FUENTES</span>
            </div>
            <div className="ficha-b">
              <div style={{ fontSize: '.82rem', marginBottom: 10 }}>{BOGIE_DISCREPANCIA.campo}</div>
              <div className="fila"><span className="k">{BOGIE_DISCREPANCIA.a.fuente}</span><span className="v">{BOGIE_DISCREPANCIA.a.valor}</span></div>
              <div className="fila"><span className="k">{BOGIE_DISCREPANCIA.b.fuente}</span><span className="v">{BOGIE_DISCREPANCIA.b.valor}</span></div>
              <p style={{ fontSize: '.74rem', marginTop: 12, color: '#c2a49c' }}>{BOGIE_DISCREPANCIA.nota}</p>
            </div>
          </div>

          <Ficha titulo="ESPECIFICACIONES" extra={<Src f="cota" />}>
            {BOGIE_ESPECIFICACIONES.map((e) => (
              <div className="fila" key={e}><span className="v" style={{ textAlign: 'left' }}>{e}</span></div>
            ))}
          </Ficha>

          <Ficha titulo="NORMAS Y REFERENCIAS">
            {BOGIE_NORMAS_REF.map((n) => (
              <div key={n.sigla} style={{ padding: '8px 0', borderBottom: '1px solid var(--linea-2)' }}>
                <div className="cota">{n.sigla}</div>
                <div style={{ fontSize: '.75rem', color: '#8b9298', marginTop: 4 }}>{n.d}</div>
              </div>
            ))}
          </Ficha>
        </aside>
      </div>

      <div style={{ marginTop: 26 }}>
        <Aviso titulo="ALCANCE DE LA FICHA">
          La ficha describe los componentes incluidos en el suministro del bogie tipo 1676.
          La estructura principal consiste en una mesa y soleras de chapa laminada soldada, con
          largueros y traviesas fabricados conforme a las normas constructivas y de ensayo de la AAR.
        </Aviso>
      </div>
    </div>
  )
}
