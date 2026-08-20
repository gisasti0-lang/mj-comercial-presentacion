import { useState } from 'react'
import { SecHead, Aviso } from '../../components/ui'
import { DOCS_FERRO, CATALOGO_PAGINAS, CATALOGOS_LAMINA } from '../../data/documentos'
import { CG35, BOGIE } from '../../data/ferrocarriles'
import { useApp } from '../../store'

/** Catálogo institucional: hojeador de las 36 páginas. */
function Catalogo() {
  const abrirDoc = useApp((s) => s.abrirDoc)
  const [pagina, setPagina] = useState(0)
  const p = CATALOGO_PAGINAS[pagina]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(210px,.26fr)', gap: 20, alignItems: 'start' }}>
      <div>
        <div className="lamina" onClick={() => abrirDoc(p.id)} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && abrirDoc(p.id)} style={{ background: '#0e1114' }}>
          <img src={p.archivo} alt={p.titulo} />
          <div className="lamina-btn"><span>EXPANDIR</span></div>
        </div>
        <div className="lamina-cap">
          <span>CATÁLOGO INSTITUCIONAL · MJ COMERCIAL S.A.</span>
          <span className="esc">{p.codigo}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
          <button className="btn" onClick={() => setPagina((n) => Math.max(0, n - 1))}>← ANTERIOR</button>
          <button className="btn" onClick={() => setPagina((n) => Math.min(CATALOGO_PAGINAS.length - 1, n + 1))}>
            SIGUIENTE →
          </button>
          <input className="slider" type="range" min={0} max={CATALOGO_PAGINAS.length - 1} value={pagina}
            onChange={(e) => setPagina(+e.target.value)} style={{ flex: 1, margin: '0 10px' }} />
          <span className="cota">{pagina + 1} / {CATALOGO_PAGINAS.length}</span>
        </div>
      </div>

      <div style={{ maxHeight: 520, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {CATALOGO_PAGINAS.map((x, i) => (
          <button key={x.id} onClick={() => setPagina(i)}
            style={{
              border: i === pagina ? '1px solid var(--acento)' : '1px solid var(--linea)',
              padding: 0, lineHeight: 0, background: '#0e1114', position: 'relative',
            }}>
            <img src={x.archivo} alt={`Página ${i + 1}`} loading="lazy" style={{ width: '100%', opacity: i === pagina ? 1 : .62 }} />
            <span className="mono" style={{
              position: 'absolute', right: 4, bottom: 3, fontSize: '.5rem',
              color: i === pagina ? 'var(--acento)' : '#6c7278',
            }}>{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DocFerro() {
  const abrirDoc = useApp((s) => s.abrirDoc)

  return (
    <div className="wrap-ancho">
      <SecHead n="05" titulo="Documentación técnica"
        bajada="Catálogos institucionales y planos originales de la línea ferroviaria, sin modificar." />

      <section style={{ marginBottom: 44 }}>
        <div className="eyebrow" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--linea)' }}>
          CATÁLOGO DE LA EMPRESA — 36 PÁGINAS
        </div>
        <Catalogo />
      </section>

      <section style={{ marginBottom: 44 }}>
        <div className="eyebrow" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--linea)' }}>
          CATÁLOGOS POR LÍNEA
        </div>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          {CATALOGOS_LAMINA.map((c) => (
            <figure key={c.id}>
              <div className="lamina" onClick={() => abrirDoc(c.id)} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && abrirDoc(c.id)}>
                <img src={c.archivo} alt={c.titulo} loading="lazy" />
                <div className="lamina-btn"><span>EXPANDIR</span></div>
              </div>
              <figcaption className="lamina-cap">
                <span>{c.codigo} · {c.titulo}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--linea)' }}>
          PLANOS — CONTENEDOR GRANERO
        </div>
        <div className="grid" style={{ gap: 1 }}>
          {DOCS_FERRO.map((d) => (
            <button key={d.id} onClick={() => abrirDoc(d.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 18, padding: '13px 16px',
                border: '1px solid var(--linea)', background: '#101317', textAlign: 'left',
              }}>
              <span className="num" style={{ width: 62, flex: '0 0 62px' }}>{d.codigo}</span>
              <span style={{ flex: 1, fontSize: '.85rem' }}>{d.titulo}</span>
              <span className="cota" style={{ width: 70, textAlign: 'right' }}>{d.escala}</span>
              <span className="btn" style={{ pointerEvents: 'none' }}>ABRIR</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="ficha">
          <div className="ficha-h"><span className="t">RÓTULO — {CG35.plano}</span></div>
          <div className="ficha-b">
            {[['Empresa', CG35.empresa], ['Conjunto', CG35.conjunto], ['Lámina', CG35.lamina],
              ['Utilización', CG35.titulo], ['Escala', CG35.escala], ['Trocha', CG35.trocha],
              ['Fecha de aprobación', CG35.fecha], ['Emisión', CG35.emision], ['Número de plano', CG35.plano],
            ].map(([k, v]) => (
              <div className="fila" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        </div>
        <div>
          <div className="ficha" style={{ marginBottom: 16 }}>
            <div className="ficha-h"><span className="t">FICHA TÉCNICA — BOGIE 1676</span></div>
            <div className="ficha-b">
              {[['Documento', BOGIE.documento], ['Referencia', BOGIE.referencia],
                ['Norma de diseño', BOGIE.normaDiseno], ['Plano de frenos', BOGIE.planoFrenos],
                ['Fecha', BOGIE.fecha],
              ].map(([k, v]) => (
                <div className="fila" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
              ))}
            </div>
          </div>
          <Aviso titulo="ORIGINALES">
            Las páginas del catálogo y las láminas se muestran tal como fueron entregadas, sin
            modificar. Los planos del contenedor y la ficha del bogie son los mismos documentos
            que alimentan los modelos tridimensionales de las secciones anteriores.
          </Aviso>
        </div>
      </div>
    </div>
  )
}
