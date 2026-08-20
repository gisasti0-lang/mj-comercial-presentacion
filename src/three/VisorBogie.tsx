import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { construirBogie, CATS_BOGIE, type ModeloBogie } from './bogie'
import { Entorno, Luces, Contorno } from './Viewer'
import { useCorte } from './useCorte'
import { useFerro, type VistaBogie } from '../storeFerro'

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function vistaBogie(v: VistaBogie, R: number) {
  const dir = (x: number, y: number, z: number, k: number) =>
    new THREE.Vector3(x, y, z).normalize().multiplyScalar(R * k)
  const c = new THREE.Vector3(0, 0.45, 0)
  const mk = (d: THREE.Vector3, t = c) => ({ p: t.clone().add(d), t })
  switch (v) {
    case 'frontal': return mk(dir(0, 0.12, 1, 3.1))
    case 'lateral': return mk(dir(1, 0.12, 0, 3.1))
    /* Leve inclinación: evita que la matriz de cámara degenere. */
    case 'planta': return mk(dir(0, 1, 0.075, 3.6), new THREE.Vector3(0, 0, 0))
    default: return mk(dir(0.72, 0.5, 0.85, 3.4))
  }
}

function Camara({ radio, controls }: { radio: number; controls: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  const vista = useFerro((s) => s.vista)
  const anim = useRef<{ p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; t: number } | null>(null)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const d = vistaBogie(vista, radio)
    anim.current = { p0: camera.position.clone(), t0: c.target.clone(), p1: d.p, t1: d.t, t: 0 }
  }, [vista, radio, camera, controls])

  useFrame((_, dt) => {
    const a = anim.current, c = controls.current
    if (!a || !c) return
    a.t = Math.min(1, a.t + dt / 1.1)
    const k = easeInOut(a.t)
    camera.position.lerpVectors(a.p0, a.p1, k)
    c.target.lerpVectors(a.t0, a.t1, k)
    c.update()
    if (a.t >= 1) anim.current = null
  })
  return null
}

function EscenaBogie({ onModelo }: { onModelo: (m: ModeloBogie) => void }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const capas = useFerro((s) => s.capas)
  const explotado = useFerro((s) => s.explotado)
  const seleccionar = useFerro((s) => s.seleccionar)
  const [objetivo, setObjetivo] = useState<{ obj: THREE.Mesh; instanceId?: number } | null>(null)

  const modelo = useMemo(() => construirBogie(), [])
  useEffect(() => { onModelo(modelo) }, [modelo, onModelo])

  useEffect(() => {
    for (const c of CATS_BOGIE) {
      const g = modelo.grupos[c.id]
      if (g) g.visible = capas[c.id]
    }
  }, [capas, modelo])

  const f = useRef(0)
  useFrame((_, dt) => {
    const obj = explotado ? 1 : 0
    if (Math.abs(f.current - obj) < 0.0015) return
    f.current += (obj - f.current) * Math.min(1, dt * 3.2)
    modelo.root.traverse((o) => {
      const b = o.userData.base as THREE.Vector3 | undefined
      const e = o.userData.explode as THREE.Vector3 | undefined
      if (b && e) o.position.copy(b).addScaledVector(e, f.current)
    })
  })

  /* Selección por raycasting propio, igual criterio que el visor de arquitectura */
  useEffect(() => {
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let desde: { x: number; y: number } | null = null
    const onDown = (e: PointerEvent) => { desde = { x: e.clientX, y: e.clientY } }
    const onUp = (e: PointerEvent) => {
      const d0 = desde; desde = null
      if (!d0 || Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 5) return
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObject(modelo.root, true).find((h) => {
        if (!h.object.visible || !h.object.userData?.nombre) return false
        let p: THREE.Object3D | null = h.object
        while (p) { if (!p.visible) return false; p = p.parent }
        return true
      })
      if (!hit) { seleccionar(null); setObjetivo(null); return }
      const d = hit.object.userData
      setObjetivo({ obj: hit.object as THREE.Mesh })
      seleccionar({ nombre: d.nombre, categoria: d.categoria, espec: d.espec, cantidad: d.cantidad, origen: d.origen })
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl, camera, modelo, seleccionar])

  const planos = useCorte(modelo.root, modelo.materiales)

  return (
    <>
      <primitive object={modelo.root} />
      <Contorno objetivo={objetivo} planos={planos} />
    </>
  )
}

export default function VisorBogie() {
  const controls = useRef<any>(null)
  const [modelo, setModelo] = useState<ModeloBogie | null>(null)
  const R = modelo?.radio ?? 1.9

  return (
    <Canvas
      shadows dpr={[1, 1.8]}
      camera={{ fov: 34, near: 0.05, far: 200, position: [4, 3, 4.6] }}
      gl={{ antialias: true, powerPreference: 'high-performance', localClippingEnabled: true }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = null
      }}
    >
      <Entorno presentacion />
      <Luces d={R * 3} presentacion />
      <EscenaBogie onModelo={setModelo} />
      <ContactShadows position={[0, 0, 0]} scale={R * 3.4} blur={2.2} opacity={0.55} far={4} resolution={1024} />
      <gridHelper args={[R * 8, 24, 0x2a3038, 0x1c2128]} position={[0, -0.002, 0]} />
      <Camara radio={R} controls={controls} />
      <OrbitControls
        ref={controls} enableDamping dampingFactor={0.07}
        minDistance={1.2} maxDistance={R * 8} maxPolarAngle={Math.PI * 0.495} makeDefault
      />
    </Canvas>
  )
}
