import type { ReactNode } from 'react'
import type { Fuente } from '../data/project'
import { docPorId } from '../data/documentos'
import { useApp } from '../store'

export function Src({ f }: { f: Fuente }) {
  const map: Record<Fuente, string> = {
    cota: 'COTA DE PLANO', medido: 'MEDIDO S/ PLANO',
    memoria: 'MEMORIA', definir: 'POR DEFINIR',
  }
  return <span className={`src src-${f}`}>{map[f]}</span>
}

export function SecHead({ n, titulo, bajada }: { n: string; titulo: string; bajada: string }) {
  return (
    <header className="sec-head">
      <div className="idx">{n}</div>
      <div className="tit">
        <h2>{titulo}</h2>
        <p>{bajada}</p>
      </div>
    </header>
  )
}

export function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="aviso">
      <div className="t">{titulo}</div>
      {children}
    </div>
  )
}

/** Lámina de documentación — abre el documento original en alta resolución */
export function Lamina({ id, alto }: { id: string; alto?: number }) {
  const abrirDoc = useApp((s) => s.abrirDoc)
  const d = docPorId(id)
  if (!d) return null
  if (!d.archivo) {
    return (
      <div className="ficha">
        <div className="ficha-h">
          <span className="t">{d.codigo} · {d.titulo}</span>
          <span className="src src-definir">POR DEFINIR</span>
        </div>
        <div className="ficha-b"><p style={{ fontSize: '.83rem' }}>{d.nota}</p></div>
      </div>
    )
  }
  return (
    <figure>
      <div className="lamina" onClick={() => abrirDoc(id)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && abrirDoc(id)}>
        <img src={d.archivo} alt={d.titulo} loading="lazy"
          style={alto ? { height: alto, objectFit: 'cover', objectPosition: 'top' } : undefined} />
        <div className="lamina-btn"><span>EXPANDIR</span></div>
      </div>
      <figcaption className="lamina-cap">
        <span>{d.codigo} · {d.titulo}</span>
        <span className="esc">{d.escala}</span>
      </figcaption>
    </figure>
  )
}

export function Fila({ k, v, f }: { k: string; v: string; f?: Fuente }) {
  return (
    <div className="fila">
      <span className="k">{k}</span>
      <span className="v" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
        {v}{f && <Src f={f} />}
      </span>
    </div>
  )
}

export function Ficha({ titulo, extra, children }: { titulo: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="ficha">
      <div className="ficha-h"><span className="t">{titulo}</span>{extra}</div>
      <div className="ficha-b">{children}</div>
    </div>
  )
}
