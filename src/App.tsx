import { useEffect } from 'react'
import Nav from './components/Nav'
import Loader from './components/Loader'
import DocModal from './components/DocModal'
import VisorGlobal from './components/VisorGlobal'
import Portada from './sections/Portada'
import Concepto from './sections/Concepto'
import Sistema from './sections/Sistema'
import Conjunto from './sections/Conjunto'
import Modulos from './sections/Modulos'
import Instalaciones from './sections/Instalaciones'
import Detalles from './sections/Detalles'
import Modelo from './sections/Modelo'
import Documentacion from './sections/Documentacion'
import PortadaFerro from './sections/ferro/PortadaFerro'
import Vagones from './sections/ferro/Vagones'
import Componentes from './sections/ferro/Componentes'
import BogieFicha from './sections/ferro/Bogie'
import Contenedor from './sections/ferro/Contenedor'
import DocFerro from './sections/ferro/DocFerro'
import PresentacionFerro from './components/PresentacionFerro'
import { useApp } from './store'

const SECCIONES = [Portada, Concepto, Sistema, Conjunto, Modulos, Instalaciones, Detalles, Modelo, Documentacion]
const SECCIONES_FERRO = [PortadaFerro, Vagones, Componentes, BogieFicha, Contenedor, DocFerro]

export default function App() {
  const seccion = useApp((s) => s.seccion)
  const irA = useApp((s) => s.irA)
  const presentando = useApp((s) => s.presentando)
  const linea = useApp((s) => s.linea)
  const lista = linea === 'ferro' ? SECCIONES_FERRO : SECCIONES
  const Sec = lista[seccion] ?? lista[0]
  /* Secciones que ocupan la pantalla sin scroll porque viven sobre un lienzo 3D */
  /* En ferroviario cada modelo vive dentro de su pestaña: ninguna sección
     ocupa la pantalla completa sobre un lienzo. */
  const suelto = linea === 'ferro' ? false : (seccion === 0 || seccion === 7)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (presentando || (e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') irA(Math.min(lista.length - 1, seccion + 1))
      if (e.key === 'ArrowUp' || e.key === 'PageUp') irA(Math.max(0, seccion - 1))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [seccion, irA, presentando, lista.length])

  return (
    <>
      <Loader />
      <div className="app">
        {!presentando && <Nav />}
        <main className="main">
          <div key={seccion}
            className={suelto ? 'entra-sec' : 'pane entra-sec'}
            style={suelto ? { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 } : undefined}>
            <Sec />
          </div>
        </main>
      </div>
      {presentando && linea === 'ferro' && <PresentacionFerro />}
      <VisorGlobal />
      <DocModal />
    </>
  )
}
