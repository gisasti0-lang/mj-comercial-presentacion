import { useEffect, useRef, useState } from 'react'
import Visor from '../three/Viewer'
import { useApp } from '../store'

/**
 * Un único Canvas persistente para toda la experiencia.
 * Se reposiciona según la sección activa: fondo de portada, panel de la
 * sección 03 (sigue al elemento #visor-anchor) o pantalla completa en la 07.
 */
export default function VisorGlobal() {
  const seccion = useApp((s) => s.seccion)
  const cargado = useApp((s) => s.cargado)
  const ref = useRef<HTMLDivElement>(null)
  const [, setTick] = useState(0)

  const linea = useApp((s) => s.linea)
  const visible = linea === 'alcaldia' && (seccion === 0 || seccion === 3 || seccion === 7)
  const anclado = linea === 'alcaldia' && seccion === 3

  /* La visibilidad se aplica siempre por estilo y nunca desde el render:
     el bucle que sigue al ancla en la sección 03 también la escribe, y si
     React la controlara además por props, una de las dos escrituras
     quedaría pisada al cambiar de sección. */
  useEffect(() => {
    const el = ref.current
    if (el) el.style.visibility = visible && cargado ? 'visible' : 'hidden'
  }, [visible, cargado, seccion, linea])

  useEffect(() => {
    if (!anclado) return
    let raf = 0
    let ancho = 0, alto = 0
    const seguir = () => {
      const a = document.getElementById('visor-anchor')
      const el = ref.current
      const main = document.querySelector('.main')
      if (a && el && main) {
        const r = a.getBoundingClientRect()
        const m = main.getBoundingClientRect()
        const fuera = r.bottom < m.top + 8 || r.top > m.bottom - 8
        el.style.visibility = fuera ? 'hidden' : 'visible'
        el.style.top = `${r.top}px`
        el.style.left = `${r.left}px`
        el.style.width = `${r.width}px`
        el.style.height = `${r.height}px`
        el.style.clipPath = `inset(${Math.max(0, m.top - r.top)}px 0 ${Math.max(0, r.bottom - m.bottom)}px 0)`
        if (Math.abs(r.width - ancho) > 1 || Math.abs(r.height - alto) > 1) {
          ancho = r.width; alto = r.height
          window.dispatchEvent(new Event('resize'))
        }
      }
      raf = requestAnimationFrame(seguir)
    }
    raf = requestAnimationFrame(seguir)
    return () => cancelAnimationFrame(raf)
  }, [anclado])

  useEffect(() => {
    if (anclado) return
    const el = ref.current
    if (!el) return
    el.style.clipPath = 'none'
    if (seccion === 0) {
      el.style.top = '0'; el.style.left = '0'; el.style.width = '100%'; el.style.height = '100%'
    } else {
      const m = document.querySelector('.main')?.getBoundingClientRect()
      el.style.top = `${m?.top ?? 0}px`
      el.style.left = `${m?.left ?? 0}px`
      el.style.width = `${m?.width ?? 0}px`
      el.style.height = `${m?.height ?? 0}px`
    }
    /* El contenedor se redimensiona por estilo, no por layout de React:
       R3F sólo vuelve a medir su lienzo ante un resize observable.
       Se usa setTimeout y no rAF porque rAF se estrangula con la pestaña
       en segundo plano y el lienzo quedaría con su tamaño por defecto. */
    const remedir = () => window.dispatchEvent(new Event('resize'))
    remedir()
    const t1 = setTimeout(remedir, 0)
    const t2 = setTimeout(remedir, 120)
    const onR = () => setTick((t) => t + 1)
    window.addEventListener('resize', onR)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('resize', onR)
    }
  }, [seccion, anclado, cargado])

  return (
    <div ref={ref}
      style={{
        position: 'fixed', zIndex: seccion === 0 ? 1 : 5, visibility: 'hidden',
        /* Valores por defecto a pantalla completa: el Canvas de R3F mide su
           contenedor en el momento del montaje, antes de que el efecto de
           arriba pueda ajustar el tamaño exacto. Si el contenedor arrancara
           en 0×0 (o sin estilo), R3F fijaría internamente un tamaño de
           canvas incorrecto (300×150, el default HTML) y no lo corrige
           solo — necesita un resize real posterior, que sí dispara bien. */
        top: 0, left: 0, width: '100vw', height: '100vh',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      {cargado && <Visor interactivo={seccion !== 0} autoRotar={seccion === 0} />}
    </div>
  )
}
