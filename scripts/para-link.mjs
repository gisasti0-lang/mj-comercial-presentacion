/**
 * Variante para publicar como página web con link propio.
 * El servicio envuelve el contenido en su propio <html><head><body>, así que
 * acá se entrega sólo el interior: título, estilos, contenedor y script.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const raiz = new URL('..', import.meta.url).pathname
const src = readFileSync(join(raiz, 'entrega/MJ-Comercial-Presentacion.html'), 'utf8')

const entre = (abre, cierra) => {
  const i = src.indexOf(abre); const j = src.indexOf(cierra, i)
  if (i < 0 || j < 0) throw new Error(`no se encontró ${abre}`)
  return src.slice(i, j + cierra.length)
}

const estilo = entre('<style>', '</style>')
const script = entre('<script>', '</script>')

const salida = [
  '<title>MJ Comercial · Presentación Técnica</title>',
  estilo,
  '<div id="root"></div>',
  script,
].join('\n')

const destino = join(raiz, 'entrega/pagina-web.html')
writeFileSync(destino, salida)
console.log(`pagina-web.html  ${(Buffer.byteLength(salida) / 1024 / 1024).toFixed(2)} MB`)
console.log(`estilos ${(estilo.length/1024).toFixed(0)} KB · script ${(script.length/1024/1024).toFixed(2)} MB`)
