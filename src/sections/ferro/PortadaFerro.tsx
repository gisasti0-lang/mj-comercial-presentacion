import { useApp } from '../../store'
import { CAPACIDAD } from '../../data/ferrocarriles'

export default function PortadaFerro() {
  const irA = useApp((s) => s.irA)
  const setPresentando = useApp((s) => s.setPresentando)
  return (
    <div className="pane">
      <div className="wrap" style={{ paddingTop: 96 }}>
        <div className="entra">
          <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', letterSpacing: '.2em', color: 'var(--tenue)' }}>
            MJ COMERCIAL S.A. · PRIMERA FÁBRICA ARGENTINA DE VAGONES FERROVIARIOS
          </div>
          <h1 style={{ margin: '16px 0 14px', maxWidth: '14ch' }}>Línea<br />Ferroviaria</h1>
          <div className="sub" style={{ fontFamily: 'var(--mono)', fontSize: '.76rem', letterSpacing: '.18em', color: 'var(--acento)' }}>
            VAGONES DE CARGA · COMPONENTES · BOGIES
          </div>
          <p className="desc" style={{ marginTop: 22, maxWidth: '54ch' }}>
            Diseño, fabricación y adaptación de vagones de carga, componentes ferroviarios
            certificados bajo normas AAR y bogies de chapa soldada. Documentación técnica
            interactiva con modelo tridimensional del bogie tipo 1676.
          </p>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 14, margin: '40px 0 36px', maxWidth: 860 }}>
            {CAPACIDAD.map((c) => (
              <div className="ficha" key={c.k}>
                <div className="ficha-b">
                  <div className="cota" style={{ fontSize: '1.45rem', color: 'var(--acento)' }}>{c.v}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--tenue)', marginTop: 6, lineHeight: 1.45 }}>{c.k}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="cta" onClick={() => irA(1)}>EXPLORAR LÍNEA →</button>
            <button className="cta" onClick={() => setPresentando(true)}
              style={{ borderColor: 'var(--linea)', color: 'var(--tenue)', background: 'none' }}>
              ▶ PRESENTATION MODE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
