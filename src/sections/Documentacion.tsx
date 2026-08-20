import { SecHead, Src } from '../components/ui'
import { DOCUMENTOS } from '../data/documentos'
import { CARATULA, EMPRESA, MEMORIA } from '../data/project'
import { useApp } from '../store'

const CATS = ['PLANOS', 'CONSTRUCTIVO', 'INSTALACIONES'] as const

export default function Documentacion() {
  const abrirDoc = useApp((s) => s.abrirDoc)

  return (
    <div className="wrap">
      <SecHead n="08" titulo="Documentación técnica"
        bajada="Los documentos originales, en alta resolución y sin modificar." />

      {CATS.map((cat) => {
        const docs = DOCUMENTOS.filter((d) => d.categoria === cat)
        return (
          <section key={cat} style={{ marginBottom: 42 }}>
            <div className="eyebrow" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--linea)' }}>
              {cat}
            </div>
            <div className="grid" style={{ gap: 1 }}>
              {docs.map((d) => (
                <button key={d.id}
                  disabled={!d.archivo}
                  onClick={() => d.archivo && abrirDoc(d.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 18, padding: '13px 16px',
                    border: '1px solid var(--linea)', background: '#101317', textAlign: 'left',
                    cursor: d.archivo ? 'pointer' : 'default', opacity: d.archivo ? 1 : .62,
                  }}>
                  <span className="num" style={{ width: 46, flex: '0 0 46px' }}>{d.codigo}</span>
                  <span style={{ flex: 1, fontSize: '.85rem' }}>{d.titulo}</span>
                  <span className="cota" style={{ width: 100, textAlign: 'right' }}>{d.escala}</span>
                  {d.archivo
                    ? <span className="btn" style={{ pointerEvents: 'none' }}>ABRIR</span>
                    : <Src f="definir" />}
                </button>
              ))}
            </div>
          </section>
        )
      })}

      <section style={{ borderTop: '1px solid var(--linea)', paddingTop: 36 }}>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div className="ficha">
            <div className="ficha-h"><span className="t">RÓTULO</span></div>
            <div className="ficha-b">
              {[
                ['Título', CARATULA.titulo], ['Empresa', CARATULA.empresa],
                ['Conjunto', CARATULA.conjunto], ['Lámina', CARATULA.lamina],
                ['Utilización', CARATULA.utilizacion], ['Escala', CARATULA.escala],
                ['Medidas', CARATULA.medidas], ['Fecha de aprobación', CARATULA.fecha],
                ['Emisión', CARATULA.emision], ['Número de plano', CARATULA.numeroPlano],
              ].map(([k, v]) => (
                <div className="fila" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
              ))}
            </div>
          </div>

          <div>
            <div className="ficha" style={{ marginBottom: 16 }}>
              <div className="ficha-h"><span className="t">MEMORIA DESCRIPTIVA</span></div>
              <div className="ficha-b" style={{ display: 'grid', gap: 14 }}>
                {[MEMORIA.origen, MEMORIA.unidadMinima, MEMORIA.crecimiento, MEMORIA.material, MEMORIA.patio, MEMORIA.acometidas]
                  .map((t, i) => <p key={i} style={{ fontSize: '.82rem', lineHeight: 1.62 }}>{t}</p>)}
              </div>
            </div>
            <div className="ficha">
              <div className="ficha-h"><span className="t">{EMPRESA.nombre}</span></div>
              <div className="ficha-b">
                <p style={{ fontSize: '.82rem', marginBottom: 12 }}>{EMPRESA.descripcion}</p>
                <div className="fila"><span className="k">Planta industrial</span><span className="v" style={{ fontSize: '.68rem' }}>{EMPRESA.planta}</span></div>
                <div className="fila"><span className="k">Administración</span><span className="v" style={{ fontSize: '.68rem' }}>{EMPRESA.administracion}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
