import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { construir, CATEGORIAS, type Categoria, type Modelo } from './build'
import { entornoEquirect } from './materials'
import { captura } from './captura'
import { useApp, type Vista } from '../store'

const ACENTO = '#ff8a1e'

/* ── Cámara: transiciones cinematográficas ──────────────────────── */
function vistaPos(v: Vista, L: number): { p: THREE.Vector3; t: THREE.Vector3 } {
  /* Radio de la esfera que envuelve al conjunto: 9000 de ancho × L de largo × 3,77 de alto */
  const R = Math.hypot(4.5, L / 2, 1.9)
  const dir = (x: number, y: number, z: number, k: number) =>
    new THREE.Vector3(x, y, z).normalize().multiplyScalar(R * k)
  const centro = new THREE.Vector3(0, 1.2, 0)
  const mk = (d: THREE.Vector3, t = centro) => ({ p: t.clone().add(d), t })
  switch (v) {
    case 'aerea':   return mk(dir(0.62, 0.54, 0.72, 3.0))
    case 'frontal': return mk(dir(0, 0.14, 1, 2.0), new THREE.Vector3(0, 1.6, 0))
    case 'lateral': return mk(dir(1, 0.14, 0, 2.2), new THREE.Vector3(0, 1.6, 0))
    /* La cenital lleva una leve inclinación a propósito: con la cámara
       exactamente sobre el objetivo, la dirección de vista queda paralela al
       vector «arriba» y la matriz de la cámara degenera en NaN. */
    case 'planta':  return mk(dir(0, 1, 0.075, 3.1), new THREE.Vector3(0, 0, 0))
    case 'corte':   return mk(dir(0.85, 0.42, 0.7, 2.2))
    default:        return mk(dir(0.62, 0.54, 0.72, 3.0))
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function Camara({ largo, controls }: { largo: number; controls: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  const vista = useApp((s) => s.vista)
  const foco = useApp((s) => s.foco)
  const anim = useRef<{ p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; t: number; dur: number } | null>(null)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    let destino: { p: THREE.Vector3; t: THREE.Vector3 }
    if (foco) {
      const t = new THREE.Vector3(foco.x, foco.y, foco.z)
      const dir = new THREE.Vector3(0.75, 0.55, 0.9).normalize().multiplyScalar(foco.dist)
      destino = { p: t.clone().add(dir), t }
    } else {
      destino = vistaPos(vista, largo)
    }
    anim.current = {
      p0: camera.position.clone(), t0: c.target.clone(),
      p1: destino.p, t1: destino.t, t: 0,
      dur: foco ? 1.0 : 1.15,
    }
  }, [vista, foco, largo, camera, controls])

  useFrame((_, dt) => {
    const a = anim.current
    const c = controls.current
    if (!a || !c) return
    a.t = Math.min(1, a.t + dt / a.dur)
    const k = easeInOut(a.t)
    camera.position.lerpVectors(a.p0, a.p1, k)
    c.target.lerpVectors(a.t0, a.t1, k)
    c.update()
    if (a.t >= 1) anim.current = null
  })
  return null
}

/* ── Entorno procedural: reflejos sin descargar ningún HDR ──────── */
export function Entorno({ presentacion }: { presentacion: boolean }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const tex = entornoEquirect(presentacion)
    const rt = pmrem.fromEquirectangular(tex)
    scene.environment = rt.texture
    scene.environmentIntensity = presentacion ? 0.55 : 0.8
    return () => {
      scene.environment = null
      rt.dispose(); pmrem.dispose(); tex.dispose()
    }
  }, [gl, scene, presentacion])
  return null
}

/* ── Iluminación ────────────────────────────────────────────────── */
export function Luces({ d, presentacion }: { d: number; presentacion: boolean }) {
  return (
    <>
      <hemisphereLight
        args={[presentacion ? 0xbcd2e8 : 0xdfe4e8, presentacion ? 0x2a2622 : 0x22262a,
          presentacion ? 1.05 : 1.5]}
      />
      <directionalLight
        position={[d * 0.7, d * 0.85, d * 0.45]}
        intensity={presentacion ? 2.5 : 1.15}
        color={presentacion ? 0xfff0dc : 0xffffff}
        castShadow={presentacion}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={d * 6}
        shadow-camera-left={-d} shadow-camera-right={d}
        shadow-camera-top={d} shadow-camera-bottom={-d}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-d * 0.6, d * 0.5, -d * 0.5]} intensity={presentacion ? 0.5 : 0.85} color={0xc8d6e2} />
      {!presentacion && <directionalLight position={[0, -d, 0]} intensity={0.35} color={0xaebac4} />}
      <Entorno presentacion={presentacion} />
    </>
  )
}

/* ── Contorno de selección ──────────────────────────────────────── */
export function Contorno({ objetivo, planos }: { objetivo: { obj: THREE.Mesh; instanceId?: number } | null; planos: THREE.Plane[] }) {
  const ref = useRef<THREE.LineSegments>(null)
  const geo = useMemo(() => {
    if (!objetivo) return null
    return new THREE.EdgesGeometry(objetivo.obj.geometry, 25)
  }, [objetivo])

  useEffect(() => () => { geo?.dispose() }, [geo])

  useFrame(() => {
    const l = ref.current
    if (!l || !objetivo) return
    objetivo.obj.updateWorldMatrix(true, false)
    if (objetivo.instanceId !== undefined && (objetivo.obj as any).isInstancedMesh) {
      const m = new THREE.Matrix4()
      ;(objetivo.obj as unknown as THREE.InstancedMesh).getMatrixAt(objetivo.instanceId, m)
      l.matrix.copy(objetivo.obj.matrixWorld).multiply(m)
    } else {
      l.matrix.copy(objetivo.obj.matrixWorld)
    }
    l.matrix.decompose(l.position, l.quaternion, l.scale)
  })

  if (!objetivo || !geo) return null
  return (
    <lineSegments ref={ref} geometry={geo} renderOrder={999}>
      <lineBasicMaterial color={ACENTO} depthTest={false} transparent opacity={0.95}
        clippingPlanes={planos.length ? planos : null} />
    </lineSegments>
  )
}

/* ── Escena ─────────────────────────────────────────────────────── */
function Escena({ onModelo }: { onModelo: (m: Modelo) => void }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const tramos = useApp((s) => s.tramos)
  const capas = useApp((s) => s.capas)
  const explotado = useApp((s) => s.explotado)
  const corte = useApp((s) => s.corte)
  const modoInst = useApp((s) => s.modoInstalaciones)
  const instalaciones = useApp((s) => s.instalaciones)
  const seleccionar = useApp((s) => s.seleccionar)
  const [objetivo, setObjetivo] = useState<{ obj: THREE.Mesh; instanceId?: number } | null>(null)
  const [planosCorte, setPlanosCorte] = useState<THREE.Plane[]>([])

  const modelo = useMemo(() => construir(tramos), [tramos])
  const anterior = useRef<Modelo | null>(null)
  useEffect(() => { onModelo(modelo) }, [modelo, onModelo])
  useEffect(() => {
    /* Libera el modelo previo al cambiar de etapa. No se libera en el desmontaje
       para que el doble efecto de StrictMode no destruya el modelo en uso. */
    if (anterior.current && anterior.current !== modelo) anterior.current.dispose()
    anterior.current = modelo
    setObjetivo(null)
  }, [modelo])

  const fantasma = useMemo(() => modelo.materiales.fantasma, [modelo])

  /* Visibilidad de capas */
  useEffect(() => {
    for (const c of CATEGORIAS) {
      const g = modelo.grupos[c.id]
      if (g) g.visible = capas[c.id]
    }
  }, [capas, modelo])

  /* Modo instalaciones: la arquitectura pasa a semitransparente */
  useEffect(() => {
    modelo.root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const esInst = o.userData.categoria === 'INSTALACIONES'
      if (modoInst && !esInst) {
        if (!o.userData.matOriginal) o.userData.matOriginal = o.material
        o.material = fantasma
        o.castShadow = false
      } else if (o.userData.matOriginal) {
        o.material = o.userData.matOriginal
        o.userData.matOriginal = undefined
        o.castShadow = true
      }
    })
  }, [modoInst, modelo, fantasma])

  /* Instalaciones individuales — sólo se muestran las activadas */
  useEffect(() => {
    const algunaActiva = Object.values(instalaciones).some(Boolean)
    modelo.grupos.INSTALACIONES.children.forEach((o) => { o.visible = algunaActiva })
  }, [instalaciones, modelo])

  /* Planos de corte */
  useEffect(() => {
    gl.localClippingEnabled = true
    const bbox = new THREE.Box3().setFromObject(modelo.root)
    const planos: THREE.Plane[] = []
    if (corte.activo) {
      const eje = corte.eje
      const min = eje === 'x' ? bbox.min.x : eje === 'y' ? bbox.min.y : bbox.min.z
      const max = eje === 'x' ? bbox.max.x : eje === 'y' ? bbox.max.y : bbox.max.z
      const v = min + (max - min) * corte.pos
      const n = new THREE.Vector3(
        eje === 'x' ? -1 : 0, eje === 'y' ? -1 : 0, eje === 'z' ? -1 : 0,
      )
      if (corte.invertido) n.negate()
      planos.push(new THREE.Plane(n, corte.invertido ? -v : v))
    }
    setPlanosCorte(planos)
    const mats = modelo.materiales as unknown as Record<string, unknown>
    Object.values(mats).forEach((m) => {
      if (m instanceof THREE.Material) {
        m.clippingPlanes = planos.length ? planos : null
        m.needsUpdate = true
      }
    })
  }, [corte, modelo, gl])

  /* Exploded view */
  const factor = useRef(0)
  useFrame((_, dt) => {
    const objetivoF = explotado ? 1 : 0
    if (Math.abs(factor.current - objetivoF) < 0.0015) return
    factor.current += (objetivoF - factor.current) * Math.min(1, dt * 3.2)
    const f = factor.current
    modelo.root.traverse((o) => {
      const b = o.userData.base as THREE.Vector3 | undefined
      const e = o.userData.explode as THREE.Vector3 | undefined
      if (b && e) o.position.copy(b).addScaledVector(e, f)
    })
  })

  /* Selección por raycasting propio sobre el lienzo.
     Se resuelve contra el rectángulo real del canvas en lugar de delegar en
     el sistema de eventos de R3F: el modelo es un grafo de three.js creado
     fuera de React y el lienzo se reposiciona por estilo, con lo que el
     tamaño interno de R3F puede quedar desfasado y desplazar los impactos. */
  useEffect(() => {
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let desde: { x: number; y: number } | null = null

    const onDown = (e: PointerEvent) => { desde = { x: e.clientX, y: e.clientY } }
    const onUp = (e: PointerEvent) => {
      const d0 = desde
      desde = null
      if (!d0) return
      if (Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 5) return  // fue órbita

      const r = el.getBoundingClientRect()
      ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      )
      ray.setFromCamera(ndc, camera)
      const planos = (modelo.materiales.chapaOndulada.clippingPlanes ?? []) as THREE.Plane[]
      const impacto = ray.intersectObject(modelo.root, true).find((h) => {
        if (!h.object.visible || !h.object.userData?.nombre) return false
        let p: THREE.Object3D | null = h.object
        while (p) { if (!p.visible) return false; p = p.parent }
        return planos.every((pl) => pl.distanceToPoint(h.point) > -0.001)
      })

      if (!impacto) { seleccionar(null); setObjetivo(null); return }
      const o = impacto.object as THREE.Mesh
      const d = o.userData
      setObjetivo({ obj: o, instanceId: impacto.instanceId })
      seleccionar({
        nombre: d.nombre, categoria: d.categoria as Categoria, modulo: d.modulo,
        ficha: d.ficha, detalle: d.detalle, cota: d.cota, origen: d.origen,
      })
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl, camera, modelo, seleccionar])

  return (
    <>
      <primitive object={modelo.root} />
      <Contorno objetivo={objetivo} planos={planosCorte} />
    </>
  )
}

/* ── Exportar la vista actual como imagen ───────────────────────────
   El lienzo se limpia después de cada cuadro, así que hay que renderizar y
   leer el resultado dentro de la misma tarea, sin esperar al siguiente. */
function Exportador() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    captura.exportar = () => {
      gl.render(scene, camera)
      const a = document.createElement('a')
      a.href = gl.domElement.toDataURL('image/png')
      const t = new Date()
      const sello = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}-${String(t.getHours()).padStart(2, '0')}${String(t.getMinutes()).padStart(2, '0')}${String(t.getSeconds()).padStart(2, '0')}`
      a.download = `alcaldia-penitenciaria-${sello}.png`
      a.click()
    }
    return () => { captura.exportar = null }
  }, [gl, scene, camera])
  return null
}

/* ── Etiquetas de exploded view ─────────────────────────────────── */
function EtiquetasExplosion({ modelo }: { modelo: Modelo | null }) {
  const explotado = useApp((s) => s.explotado)
  const capas = useApp((s) => s.capas)
  const [, force] = useState(0)
  useFrame(() => { if (explotado) force((v) => (v + 1) % 1000) })
  if (!modelo || !explotado) return null

  const items = CATEGORIAS.filter((c) => capas[c.id]).map((c) => {
    const g = modelo.grupos[c.id]
    if (!g || !g.children.length) return null
    const b = new THREE.Box3().setFromObject(g)
    if (b.isEmpty()) return null
    const ctr = b.getCenter(new THREE.Vector3())
    return { id: c.id, label: c.label, p: new THREE.Vector3(b.max.x + 0.6, ctr.y, ctr.z) }
  }).filter(Boolean) as { id: string; label: string; p: THREE.Vector3 }[]

  return (
    <>
      {items.map((it) => (
        <Html key={it.id} position={it.p} center={false} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
          <div className="expl-tag"><span className="expl-dot" />{it.label}</div>
        </Html>
      ))}
    </>
  )
}

/* ── Visor ──────────────────────────────────────────────────────── */
export default function Visor({ interactivo = true, autoRotar = false }: { interactivo?: boolean; autoRotar?: boolean }) {
  const controls = useRef<any>(null)
  const [modelo, setModelo] = useState<Modelo | null>(null)
  const modo = useApp((s) => s.modo)
  const tramos = useApp((s) => s.tramos)
  const largo = 3 + 12 * tramos

  return (
    <Canvas
      shadows={modo === 'presentacion'}
      dpr={[1, 1.8]}
      camera={{ fov: 34, near: 0.1, far: 1200, position: [26, 22, 30] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = null
      }}
    >
      <fog attach="fog" args={[modo === 'presentacion' ? 0x11151a : 0x0d0f12, largo * 3, largo * 9]} />
      <Luces d={largo * 0.9} presentacion={modo === 'presentacion'} />
      <Escena onModelo={setModelo} />
      <Exportador />
      <EtiquetasExplosion modelo={modelo} />
      <ContactShadows
        position={[0, -0.32, 0]} scale={largo * 2.2} blur={2.4}
        opacity={modo === 'presentacion' ? 0.62 : 0.3} far={12} resolution={1024}
      />
      <gridHelper
        args={[largo * 4, Math.round(largo * 4 / 3), 0x2a3038, 0x1c2128]}
        position={[0, -0.33, 0]}
      />
      <Camara largo={largo} controls={controls} />
      <OrbitControls
        ref={controls} enabled={interactivo}
        autoRotate={autoRotar} autoRotateSpeed={0.14}
        enableDamping dampingFactor={0.07}
        minDistance={1.6} maxDistance={largo * 6}
        maxPolarAngle={Math.PI * 0.495}
        makeDefault
      />
    </Canvas>
  )
}
