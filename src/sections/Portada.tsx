import { useApp } from '../store'
import { CARATULA } from '../data/project'

const ETIQUETAS = [
  { t: 'SISTEMA MODULAR', top: '26%', left: '58%', d: 1.1 },
  { t: 'ESTRUCTURA DE ACERO', top: '41%', left: '69%', d: 1.45 },
  { t: 'ANTEPROYECTO', top: '57%', left: '61%', d: 1.8 },
]

export default function Portada() {
  const irA = useApp((s) => s.irA)
  return (
    <div className="portada">
      <div className="portada-veil" />
      <div className="etiquetas-flot">
        {ETIQUETAS.map((e) => (
          <div key={e.t} className="etiq" style={{ top: e.top, left: e.left, animationDelay: `${e.d}s` }}>
            {e.t}
          </div>
        ))}
      </div>

      <div className="portada-cont entra">
        <div className="sub">{CARATULA.empresa} · {CARATULA.utilizacion}</div>
        <h1>Alcaldía<br />Penitenciaria</h1>
        <div className="sub" style={{ color: 'var(--acento)' }}>SISTEMA MODULAR DE ACERO</div>
        <p className="desc">
          Anteproyecto arquitectónico · Sistema constructivo modular.
          Presentación técnica interactiva construida a partir de la lámina
          <span className="mono" style={{ color: '#cfd6dc' }}> {CARATULA.conjunto} / {CARATULA.lamina}</span>,
          escala {CARATULA.escala}, emisión {CARATULA.emision} — {CARATULA.fecha}.
        </p>
        <button className="cta" onClick={() => irA(1)}>EXPLORAR PROYECTO →</button>
      </div>
    </div>
  )
}
