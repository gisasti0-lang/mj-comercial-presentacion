import { PanelControl, PanelInfo, Modos, Brujula } from '../components/ControlesVisor'
import ModoPresentacion from '../components/ModoPresentacion'
import { useApp } from '../store'
import { captura } from '../three/captura'

export default function Modelo() {
  const presentando = useApp((s) => s.presentando)
  const setPresentando = useApp((s) => s.setPresentando)
  const tramos = useApp((s) => s.tramos)

  return (
    <div className="hud">
      {!presentando && (
        <>
          <PanelControl />
          <PanelInfo />
          <Brujula />
          <Modos />
          <div className="visor-tit">
            <div className="a">ALCALDÍA PENITENCIARIA</div>
            <div className="b">SISTEMA MODULAR · {3000 + 12000 * tramos} × 9000 × 3770 MM</div>
          </div>
          <div style={{
            position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 8,
          }}>
            <button className="btn btn-l" onClick={() => setPresentando(true)}>
              ▶ PRESENTATION MODE
            </button>
            <button className="btn btn-l" onClick={() => captura.exportar?.()}
              title="Descarga la vista actual como PNG, para pegar en un mail o una presentación">
              ↓ EXPORTAR IMAGEN
            </button>
          </div>
        </>
      )}
      {presentando && <ModoPresentacion />}
    </div>
  )
}
