/**
 * Empaqueta el sitio compilado en un único archivo HTML autocontenido.
 * Incrusta el JS, el CSS y todas las láminas del plano como data URI, de modo
 * que la presentación se abra con doble click, sin servidor ni conexión.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const raiz = new URL('..', import.meta.url).pathname
const dist = join(raiz, 'dist')
const salida = join(raiz, 'entrega')

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
}
const dataURI = (ruta) => {
  const ext = extname(ruta).toLowerCase()
  return `data:${MIME[ext] ?? 'application/octet-stream'};base64,${readFileSync(ruta).toString('base64')}`
}

let html = readFileSync(join(dist, 'index.html'), 'utf8')
let js = readFileSync(join(dist, 'app.js'), 'utf8')
const css = readFileSync(join(dist, 'app.css'), 'utf8')

/* Las láminas viven en public/ y se referencian por URL en tiempo de ejecución:
   se reemplaza cada literal por su data URI. */
const docs = join(dist, 'docs')
let incrustadas = 0, bytes = 0

/* Recorre también las subcarpetas: las páginas del catálogo viven en docs/catalogo/. */
function incrustarDesde(dir, prefijo) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === 'manifest.json') continue
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) { incrustarDesde(ruta, `${prefijo}${entrada.name}/`); continue }
    const literal = `${prefijo}${entrada.name}`
    if (js.includes(literal)) {
      const uri = dataURI(ruta)
      js = js.split(`"${literal}"`).join(`"${uri}"`).split(`'${literal}'`).join(`'${uri}'`)
      incrustadas++; bytes += statSync(ruta).size
    }
  }
}
incrustarDesde(docs, '/docs/')

/* El script se emite al final del body: al dejar de ser un módulo pierde el
   diferido implícito y ejecutarlo desde el <head> encontraría un #root inexistente. */
html = html
  .replace(/<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/, '')
  .replace(/<link[^>]*href="[^"]*app\.css"[^>]*>/, () => `<style>${css}</style>`)
  .replace('</body>', `<script>${js}</script></body>`)

mkdirSync(salida, { recursive: true })
const destino = join(salida, 'Alcaldia-Penitenciaria.html')
writeFileSync(destino, html)

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB'
console.log(`Láminas incrustadas : ${incrustadas} (${mb(bytes)} en origen)`)
console.log(`Archivo final       : entrega/Alcaldia-Penitenciaria.html  ${mb(Buffer.byteLength(html))}`)
if (/src="\.?\/?assets|href="\.?\/?assets|"\/docs\//.test(html)) {
  console.error('AVISO: quedaron referencias externas sin incrustar.')
  process.exit(1)
}
console.log('Sin referencias externas: se abre con doble click.')
