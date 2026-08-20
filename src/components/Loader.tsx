import { useEffect, useState } from 'react'
import { useApp } from '../store'

const PASOS = ['STRUCTURE', 'MODULES', 'SYSTEMS', '3D MODEL']

export default function Loader() {
  const cargado = useApp((s) => s.cargado)
  const setCargado = useApp((s) => s.setCargado)
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const dur = 2300
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      setP(Math.round(k * 100))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    /* requestAnimationFrame se estrangula con la pestaña en segundo plano:
       el pase a "listo" no puede depender de él. */
    const fin = setTimeout(() => { setP(100); setCargado(true) }, dur + 380)
    return () => { cancelAnimationFrame(raf); clearTimeout(fin) }
  }, [setCargado])

  const activos = Math.floor((p / 100) * PASOS.length + 0.001)

  return (
    <div className={`loader${cargado ? ' off' : ''}`} aria-hidden={cargado}>
      {/* Los dos verticales, dibujados con el mismo trazo: sección
          transversal de la alcaldía y elevación de un vagón de carga. */}
      <svg className="loader-svg" viewBox="0 0 380 232" fill="none">
        <g style={{ ['--len' as string]: 900 }}>
          {/* ── alcaldía: sección transversal ── */}
          <line x1="20" y1="104" x2="360" y2="104" style={{ animationDelay: '0s' }} />
          <rect x="20" y="42" width="113" height="62" style={{ animationDelay: '.10s' }} />
          <rect x="133" y="42" width="114" height="62" style={{ animationDelay: '.20s' }} />
          <rect x="247" y="42" width="113" height="62" style={{ animationDelay: '.30s' }} />
          <path d="M14 42 L133 34" style={{ animationDelay: '.42s' }} />
          <path d="M366 42 L247 34" style={{ animationDelay: '.42s' }} />
          <path d="M133 22 L133 34 M247 22 L247 34" style={{ animationDelay: '.54s' }} />
          <path d="M124 22 L190 6 L256 22" style={{ animationDelay: '.66s' }} />
          <path d="M150 22 L150 34 M170 22 L170 34 M190 22 L190 34 M210 22 L210 34 M230 22 L230 34"
            style={{ animationDelay: '.78s' }} />
          <path d="M40 104 L40 114 M100 104 L100 114 M280 104 L280 114 M340 104 L340 114"
            style={{ animationDelay: '.88s' }} />

          {/* ── ferroviario: elevación de vagón ── */}
          <line x1="20" y1="212" x2="360" y2="212" style={{ animationDelay: '.98s' }} />
          <rect x="46" y="146" width="288" height="46" style={{ animationDelay: '1.06s' }} />
          <path d="M40 146 L340 146" style={{ animationDelay: '1.16s' }} />
          <path d="M76 146 L76 192 M124 146 L124 192 M172 146 L172 192 M220 146 L220 192 M268 146 L268 192 M304 146 L304 192"
            style={{ animationDelay: '1.24s' }} />
          <path d="M46 192 L334 192" style={{ animationDelay: '1.32s' }} />
          {/* bogies */}
          <path d="M72 192 L72 200 M132 192 L132 200 M248 192 L248 200 M308 192 L308 200"
            style={{ animationDelay: '1.40s' }} />
          <path d="M66 200 L138 200 M242 200 L314 200" style={{ animationDelay: '1.46s' }} />
          <circle cx="84" cy="206" r="6" style={{ ['--len' as string]: 40, animationDelay: '1.54s' }} />
          <circle cx="120" cy="206" r="6" style={{ ['--len' as string]: 40, animationDelay: '1.58s' }} />
          <circle cx="260" cy="206" r="6" style={{ ['--len' as string]: 40, animationDelay: '1.62s' }} />
          <circle cx="296" cy="206" r="6" style={{ ['--len' as string]: 40, animationDelay: '1.66s' }} />
          {/* enganches */}
          <path d="M46 176 L32 176 M334 176 L348 176" style={{ animationDelay: '1.72s' }} />
        </g>
      </svg>

      <div className="loader-barra"><i style={{ width: `${p}%` }} /></div>

      <div className="loader-pasos">
        {PASOS.map((s, i) => (
          <div key={s} className={`loader-paso${i < activos ? ' on' : ''}`}>
            <span>{s}</span><b>{i < activos ? 'OK' : '··'}</b>
          </div>
        ))}
        <div className={`loader-paso${p >= 100 ? ' on' : ''}`} style={{ marginTop: 8 }}>
          <span>{p >= 100 ? '100% — READY' : 'LOADING PROJECT'}</span><b>{p}%</b>
        </div>
      </div>

    </div>
  )
}
