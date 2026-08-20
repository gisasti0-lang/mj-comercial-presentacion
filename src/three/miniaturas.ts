import * as THREE from 'three'
import { crearMateriales, entornoEquirect, type Materiales } from './materials'
import { construirPieza } from './piezas'
import { construirBogie } from './bogie'

/* ═══════════════════════════════════════════════════════════════
   MINIATURAS DE CATÁLOGO
   Un único renderer fuera de pantalla dibuja cada pieza una sola vez
   y devuelve la imagen. Evita abrir un contexto WebGL por tarjeta,
   que el navegador limitaría a una decena.
   ═══════════════════════════════════════════════════════════════ */

const LADO = 420
const cache = new Map<string, string | null>()

let renderer: THREE.WebGLRenderer | null = null
let escena: THREE.Scene | null = null
let camara: THREE.PerspectiveCamera | null = null
let mats: Materiales | null = null

function iniciar() {
  if (renderer) return
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setSize(LADO, LADO)
  renderer.setPixelRatio(1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  escena = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = entornoEquirect(true)
  escena.environment = pmrem.fromEquirectangular(tex).texture
  escena.environmentIntensity = 0.7
  tex.dispose(); pmrem.dispose()

  escena.add(new THREE.HemisphereLight(0xbcd2e8, 0x2a2622, 1.1))
  const key = new THREE.DirectionalLight(0xfff0dc, 2.4)
  key.position.set(3, 4, 3)
  escena.add(key)
  const fill = new THREE.DirectionalLight(0xc8d6e2, 0.7)
  fill.position.set(-3, 2, -2)
  escena.add(fill)

  camara = new THREE.PerspectiveCamera(30, 1, 0.01, 100)
  mats = crearMateriales()
}

/** Devuelve la miniatura del componente, o null si no tiene geometría documentada. */
export function miniatura(codigo: string): string | null {
  if (cache.has(codigo)) return cache.get(codigo)!
  try {
    iniciar()
    /* El bogie completo se toma del modelo tridimensional documentado */
    const pieza = codigo === 'BGE-001'
      ? construirBogie(mats!).root
      : construirPieza(codigo, mats!)
    if (!pieza) { cache.set(codigo, null); return null }

    escena!.add(pieza)
    /* encuadre automático sobre la caja envolvente de la pieza */
    const bb = new THREE.Box3().setFromObject(pieza)
    const centro = bb.getCenter(new THREE.Vector3())
    const radio = bb.getSize(new THREE.Vector3()).length() / 2
    const dist = radio / Math.sin((camara!.fov * Math.PI) / 360) * 1.06
    camara!.position.copy(centro).add(new THREE.Vector3(0.62, 0.48, 0.85).normalize().multiplyScalar(dist))
    camara!.lookAt(centro)
    camara!.updateProjectionMatrix()

    renderer!.render(escena!, camara!)
    const url = renderer!.domElement.toDataURL('image/webp', 0.9)

    escena!.remove(pieza)
    pieza.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() })
    cache.set(codigo, url)
    return url
  } catch {
    cache.set(codigo, null)
    return null
  }
}
