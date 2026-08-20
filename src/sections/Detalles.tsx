import { SecHead, Lamina, Ficha, Src, Aviso } from '../components/ui'
import { DETALLES, FICHAS, POR_DEFINIR } from '../data/project'
import { useApp } from '../store'

export default function Detalles() {
  const abrirDoc = useApp((s) => s.abrirDoc)
  const irA = useApp((s) => s.irA)
  const setCapas = useApp((s) => s.setCapas)

  return (
    <div className="wrap">
      <SecHead n="06" titulo="Detalles constructivos"
        bajada="Muros, pisos y techo según los detalles a escala 1:10 de la lámina." />

      <div className="grid" style={{ gap: 26, marginBottom: 46 }}>
        {DETALLES.map((d) => (
          <div key={d.id} style={{ border: '1px solid var(--linea)', background: '#101317' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--linea)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span className="num">{d.codigo}</span>
                <h3>{d.titulo}</h3>
              </div>
              <span className="cota">ESCALA {d.escala}</span>
            </div>

            {d.nota ? (
              <div style={{ padding: 20 }}>
                <Aviso titulo="POR DEFINIR">{d.nota}</Aviso>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(240px,.85fr)', gap: 22, padding: 20 }}
                className="det-grid">
                <Lamina id={d.doc} />
                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>COMPOSICIÓN</div>
                  {d.capas.map((c, i) => (
                    <div className="fila" key={i}>
                      <span className="k">
                        {c.nombre}
                        {c.cara && <span className="mono" style={{ fontSize: '.6rem', color: '#5c646c', marginLeft: 8 }}>{c.cara}</span>}
                      </span>
                      <span className="v" style={{ color: c.espesor === POR_DEFINIR ? '#d08a7a' : undefined }}>
                        {c.espesor}
                      </span>
                    </div>
                  ))}
                  {d.perfiles.length > 0 && (
                    <>
                      <div className="eyebrow" style={{ margin: '18px 0 9px' }}>PERFILERÍA</div>
                      {d.perfiles.map((p) => (
                        <div className="fila" key={p.nombre}>
                          <span className="k">{p.nombre}</span>
                          <span className="v" style={{ color: 'var(--acento-2)' }}>{p.perfil}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => abrirDoc(d.doc)}>EXPANDIR</button>
                    <button className="btn" onClick={() => {
                      setCapas({ MUROS: d.id === 'muros', TECHOS: d.id === 'techo', PISOS: d.id === 'pisos', ESTRUCTURA: true })
                      irA(7)
                    }}>VER EN MODELO →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 40 }}>
        <h3 style={{ marginBottom: 6 }}>Fichas de elementos constructivos</h3>
        <p style={{ fontSize: '.88rem', marginBottom: 24 }}>
          Únicamente los elementos nombrados y acotados en la lámina. Los espesores que el plano no
          indica figuran como POR DEFINIR.
        </p>
        <div className="grid g3">
          {FICHAS.map((f) => (
            <Ficha key={f.id} titulo={f.tipo} extra={<Src f={f.fuente} />}>
              <h3 style={{ fontSize: '.86rem', marginBottom: 8 }}>{f.nombre}</h3>
              <div className="cota" style={{
                fontSize: '.9rem',
                color: (f.perfil ?? f.espesor) === POR_DEFINIR ? '#d08a7a' : 'var(--acento-2)',
              }}>
                {f.perfil ?? f.espesor}
              </div>
              <button className="btn" style={{ width: '100%', marginTop: 15 }}
                onClick={() => { irA(7) }}>VER EN MODELO →</button>
            </Ficha>
          ))}
        </div>
      </div>
    </div>
  )
}
