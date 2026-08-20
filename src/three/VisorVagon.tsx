import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { construirVagon, CATS_VAGON, type ModeloVagon } from './vagon'
import { Entorno, Luces, Contorno } from './Viewer'
import { useCorte } from './useCorte'
import { useFerro } from '../storeFerro'
import { VAGONES_3D } from '../data/ferrocarriles'

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function Escena({ onModelo }: { onModelo: (m: ModeloVagon) => void }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const idVagon = useFerro((s) => s.vagon)
  const capas = useFerro((s) => s.capasVagon)
  const explotado = useFerro((s) => s.explotadoVagon)
  const seleccionar = useFerro((s) => s.seleccionarVagon)
  const [objetivo, setObjetivo] = useState<{ obj: THREE.Mesh } | null>(null)

  const modelo = useMemo(() => {
    const v = VAGONES_3D.find((x) => x.id === idVagon) ?? VAGONES_3D[0]
    return construirVagon(v)
  }, [idVagon])

  const anterior = useRef<ModeloVagon | null>(null)
  useEffect(() => {
    if (anterior.current && anterior.current !== modelo) anterior.current.dispose()
    anterior.current = modelo
    setObjetivo(null)
    onModelo(modelo)
  }, [modelo, onModelo])

  useEffect(() => {
    for (const c of CATS_VAGON) {
      const g = modelo.grupos[c.id]
      if (g) g.visible = capas[c.id] ?? true
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
      seleccionar({ nombre: d.nombre, categoria: d.categoria, espec: d.espec })
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

function Camara({ radio, controls }: { radio: number; controls: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  const idVagon = useFerro((s) => s.vagon)
  const anim = useRef<{ p0: THREE.Vector3; p1: THREE.Vector3; t: number } | null>(null)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const p1 = new THREE.Vector3(0.62, 0.42, 0.9).normalize().multiplyScalar(radio * 2.6)
    p1.y += 0.6
    anim.current = { p0: camera.position.clone(), p1, t: 0 }
    c.target.set(0, radio * 0.35, 0)
  }, [idVagon, radio, camera, controls])

  useFrame((_, dt) => {
    const a = anim.current, c = controls.current
    if (!a || !c) return
    a.t = Math.min(1, a.t + dt / 1.1)
    camera.position.lerpVectors(a.p0, a.p1, easeInOut(a.t))
    c.update()
    if (a.t >= 1) anim.current = null
  })
  return null
}

export default function VisorVagon() {
  const controls = useRef<any>(null)
  const [modelo, setModelo] = useState<ModeloVagon | null>(null)
  const R = modelo?.radio ?? 7

  return (
    <Canvas
      shadows dpr={[1, 1.7]}
      camera={{ fov: 32, near: 0.1, far: 600, position: [14, 9, 20] }}
      gl={{ antialias: true, powerPreference: 'high-performance', localClippingEnabled: true }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = null
      }}
    >
      <Entorno presentacion />
      <Luces d={R * 2.4} presentacion />
      <Escena onModelo={setModelo} />
      <ContactShadows position={[0, 0, 0]} scale={R * 3} blur={2.4} opacity={0.5} far={8} resolution={1024} />
      <gridHelper args={[R * 6, 30, 0x2a3038, 0x1c2128]} position={[0, -0.004, 0]} />
      <Camara radio={R} controls={controls} />
      <OrbitControls ref={controls} enableDamping dampingFactor={0.07}
        minDistance={3} maxDistance={R * 7} maxPolarAngle={Math.PI * 0.495} makeDefault />
    </Canvas>
  )
}
