import * as THREE from 'three'
import type { Materiales } from './materials'

/* ═══════════════════════════════════════════════════════════════
   PIEZAS DEL CATÁLOGO
   Geometría de cada componente, para mostrarlo en su ficha.
   Las que ya existen en el bogie 1676 usan sus mismas cotas.
   Unidades: milímetros; la pieza queda centrada en el origen.
   ═══════════════════════════════════════════════════════════════ */

const S = 0.001

class Helice extends THREE.Curve<THREE.Vector3> {
  constructor(private r: number, private h: number, private v: number) { super() }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = 2 * Math.PI * this.v * t
    return target.set(Math.cos(a) * this.r, this.h * (t - 0.5), Math.sin(a) * this.r)
  }
}

const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, rot?: [number, number, number]) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), m)
  o.position.set(x * S, y * S, z * S)
  if (rot) o.rotation.set(...rot)
  o.castShadow = o.receiveShadow = true
  return o
}
const cyl = (r: number, h: number, m: THREE.Material, x = 0, y = 0, z = 0, rot?: [number, number, number], seg = 30) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, seg), m)
  o.position.set(x * S, y * S, z * S)
  if (rot) o.rotation.set(...rot)
  o.castShadow = o.receiveShadow = true
  return o
}
const muelle = (dExt: number, dAl: number, alto: number, vueltas: number, m: THREE.Material) => {
  const g = new THREE.TubeGeometry(
    new Helice((dExt - dAl) / 2 * S, alto * S, vueltas), Math.round(vueltas * 14), (dAl / 2) * S, 8, false)
  const o = new THREE.Mesh(g, m); o.castShadow = true; return o
}
const tubo = (dExt: number, esp: number, largo: number, m: THREE.Material, rot?: [number, number, number]) => {
  const g = new THREE.Group()
  const shape = new THREE.Shape()
  shape.absarc(0, 0, (dExt / 2) * S, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, (dExt / 2 - esp) * S, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, { depth: largo * S, bevelEnabled: false, curveSegments: 28 })
  geo.translate(0, 0, -largo * S / 2)
  const o = new THREE.Mesh(geo, m); o.castShadow = o.receiveShadow = true
  if (rot) o.rotation.set(...rot)
  g.add(o); return g
}

/** Construye la pieza de catálogo pedida. Devuelve null si el componente
 *  no tiene geometría documentada: no se inventa una forma. */
export function construirPieza(codigo: string, M: Materiales): THREE.Group | null {
  const g = new THREE.Group()
  switch (codigo) {
    /* ── FRENO ─────────────────────────────────────────────────── */
    case 'FRN-001': /* Cilindro de freno 10" × 12" */
      g.add(cyl(127, 305, M.acero, 0, 0, 0, [0, 0, Math.PI / 2]))
      g.add(cyl(140, 40, M.aceroClaro, -170, 0, 0, [0, 0, Math.PI / 2]))
      g.add(cyl(30, 180, M.aceroClaro, 240, 0, 0, [0, 0, Math.PI / 2]))
      break
    case 'FRN-002': /* Depósito de freno combinado */
      g.add(cyl(190, 620, M.acero, 0, 0, 0, [0, 0, Math.PI / 2]))
      for (const s of [-1, 1]) g.add(cyl(190, 30, M.aceroClaro, s * 320, 0, 0, [0, 0, Math.PI / 2]))
      g.add(cyl(24, 150, M.aceroClaro, 120, 150, 0))
      break
    case 'FRN-003': /* Travesaño de freno tipo UNIT */
      g.add(box(2400, 110, 120, M.acero))
      for (const s of [-1, 1]) g.add(box(150, 320, 70, M.chapaInterior, s * 1100, 90, 0, [0.3, 0, 0]))
      break
    case 'FRN-004': /* Timonería de freno */
      for (const s of [-1, 1]) g.add(box(60, 620, 30, M.chapaLisa, s * 200, 0, 0))
      g.add(box(520, 50, 30, M.chapaLisa, 0, 240, 0))
      g.add(box(520, 50, 30, M.chapaLisa, 0, -240, 0))
      break
    case 'FRN-005': /* Regulador automático de freno */
      g.add(cyl(70, 620, M.acero, 0, 0, 0, [0, 0, Math.PI / 2]))
      g.add(box(240, 180, 140, M.aceroClaro, -240, 0, 0))
      g.add(cyl(26, 260, M.aceroClaro, 320, 0, 0, [0, 0, Math.PI / 2]))
      break
    case 'FRN-006': /* Llave angular 1¼" */
      g.add(cyl(34, 150, M.acero, 0, 0, 0, [0, 0, Math.PI / 2]))
      g.add(cyl(34, 130, M.acero, 60, 65, 0))
      g.add(box(180, 22, 34, M.chapaLisa, 40, 140, 0, [0, 0, 0.25]))
      break
    case 'FRN-010': /* Leva de freno */
      g.add(cyl(90, 200, M.acero, 0, 0, 0, [Math.PI / 2, 0, 0]))
      g.add(box(230, 120, 90, M.acero, 90, 0, 0))
      g.add(cyl(30, 220, M.aceroClaro, 0, 0, 0, [Math.PI / 2, 0, 0]))
      break
    case 'FRN-011': /* Barra de empuje — ASTM A53 SCH 80 */
      g.add(tubo(96, 8, 1180, M.acero, [0, Math.PI / 2, 0]))
      for (const s of [-1, 1]) g.add(box(120, 150, 60, M.aceroClaro, s * 620, 0, 0))
      break
    case 'FRN-012': /* Clavijas y pasadores */
      for (let i = 0; i < 4; i++) {
        g.add(cyl(16, 200, M.aceroClaro, -150 + i * 100, 0, 0))
        g.add(cyl(26, 20, M.acero, -150 + i * 100, 110, 0))
      }
      break

    /* ── BOGIE ─────────────────────────────────────────────────── */
    case 'BGE-002': /* Aro separador centro de bogie */
      g.add(tubo(430, 55, 40, M.aceroClaro, [Math.PI / 2, 0, 0]))
      break
    case 'BGE-003': /* Disco separador centro de bogie */
      g.add(cyl(215, 26, M.aceroClaro))
      break
    case 'BGE-004': /* Placas laterales constant contact */
      g.add(box(230, 120, 190, M.acero))
      g.add(box(180, 60, 150, M.aceroClaro, 0, 88, 0))
      break
    case 'BGE-005': /* Resorte Barber */
      g.add(muelle(140, 27, 260, 6, M.acero))
      break
    case 'BGE-006': /* Resorte de suspensión exterior — Ø140, alambre 27 */
      g.add(muelle(140, 27, 260, 6, M.acero))
      break
    case 'BGE-007': /* Resorte de suspensión interior — Ø86, alambre 17 */
      g.add(muelle(86, 17, 240, 7, M.aceroClaro))
      break
    case 'BGE-008': /* Adaptador 5½" × 10" */
      g.add(box(300, 130, 270, M.acero))
      g.add(box(340, 40, 300, M.aceroClaro, 0, -85, 0))
      break
    case 'BGE-009': /* Cuña de fricción Ride Control */
      g.add(box(180, 230, 150, M.aceroClaro, 0, 0, 0, [0, 0, 0.16]))
      break
    case 'BGE-010': /* Adaptador ferroviario */
      g.add(box(520, 90, 380, M.acero))
      g.add(cyl(120, 60, M.aceroClaro, 0, 70, 0))
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        g.add(cyl(18, 130, M.aceroClaro, sx * 200, -50, sz * 140))
      }
      break

    /* ── ENGANCHE ──────────────────────────────────────────────── */
    case 'ENG-001': /* Boquilla para gancho y enganche */
      g.add(box(560, 180, 90, M.acero, 0, 160, 0))
      g.add(box(560, 180, 90, M.acero, 0, -160, 0))
      g.add(box(90, 420, 90, M.acero, -240, 0, 0))
      break
    case 'ENG-002': /* Boquilla enganche automático Type E */
      g.add(box(620, 200, 120, M.acero, 0, 170, 0))
      g.add(box(620, 200, 120, M.acero, 0, -170, 0))
      g.add(box(120, 460, 120, M.acero, -260, 0, 0))
      g.add(cyl(60, 480, M.aceroClaro, 240, 0, 0, [Math.PI / 2, 0, 0]))
      break
    case 'ENG-003': /* Kit de colocación de enganche automático */
      g.add(box(420, 260, 300, M.acero, -120, 0, 0))
      g.add(box(240, 200, 160, M.aceroClaro, 180, 40, 0, [0, 0.4, 0]))
      g.add(cyl(34, 300, M.aceroClaro, 60, -60, 120))
      g.add(muelle(120, 22, 200, 5, M.acero).translateX(0.22).translateY(-0.05))
      break

    case 'FRN-007': /* Mangas de freno con glad hands */
      for (const sz of [-1, 1]) {
        const curva = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.42, 0.02 * sz, 0.06 * sz), new THREE.Vector3(-0.15, 0.14, 0.02 * sz),
          new THREE.Vector3(0.15, 0.10, -0.03 * sz), new THREE.Vector3(0.42, -0.04, 0.05 * sz),
        ])
        const m = new THREE.Mesh(new THREE.TubeGeometry(curva, 44, 0.019, 10, false), M.acero)
        m.position.z = sz * 0.07; m.castShadow = true; g.add(m)
      }
      for (const sx of [-1, 1]) g.add(cyl(46, 70, M.aceroClaro, sx * 430, sx > 0 ? -40 : 20, 0, [0, 0, Math.PI / 2]))
      break
    case 'FRN-008': /* Freno de mano — volante vertical */
      g.add(tubo(420, 34, 48, M.acero))
      for (let i = 0; i < 4; i++) {
        g.add(box(380, 34, 34, M.acero, 0, 0, 0, [0, 0, (i * Math.PI) / 4]))
      }
      g.add(cyl(34, 420, M.aceroClaro, 0, -300, 0))
      g.add(box(220, 130, 130, M.acero, 0, -520, 0))
      break
    case 'FRN-009': /* Cañería de freno */
      for (const dz of [-90, 90]) {
        g.add(cyl(19, 900, M.aceroClaro, 0, 0, dz, [0, 0, Math.PI / 2], 20))
        g.add(cyl(19, 200, M.aceroClaro, 430, -90, dz, undefined, 20))
        g.add(cyl(30, 44, M.acero, 430, -190, dz, undefined, 20))
      }
      g.add(box(120, 70, 250, M.acero, -400, 0, 0))
      break

    default:
      return null
  }
  g.traverse((o) => { if (o instanceof THREE.Mesh) o.userData.pieza = codigo })
  return g
}
