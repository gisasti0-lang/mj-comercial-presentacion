/**
 * Resuelve la ruta de un recurso contra la base del sitio.
 *
 * Las rutas se escriben absolutas (`/docs/…`) porque el empaquetador del
 * entregable las busca así, como literales, para reemplazarlas por data URI.
 * Pero el sitio publicado cuelga de un subdirectorio
 * (`/mj-comercial-presentacion/`), donde una ruta absoluta apuntaría fuera
 * del sitio. Esta función antepone la base en tiempo de ejecución y deja
 * intactos los data URI ya incrustados.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const ruta = (p: string | null | undefined): string => {
  if (!p) return ''
  if (p.startsWith('data:') || p.startsWith('http')) return p
  return BASE + p
}
