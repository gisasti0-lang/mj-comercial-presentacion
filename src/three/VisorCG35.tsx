import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { construirCG35, CATS_CG35, type ModeloCG35 } from './contenedor'
import { construirVagon } from './vagon'
import { VAGONES_3D } from '../data/ferrocarriles'
import { Entorno, Luces, Contorno } from './Viewer'
import { useCorte } from './useCorte'
import { useFerro } from '../storeFerro'

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Vagón portacontenedor sobre el que se apoya el contenedor.
 *  La documentación declara la plataforma apta para dos contenedores ISO
 *  de 20′, y el CG35 mide 6000 mm entre cabezales. */
const PORTA = VAGONES_3D.find((v) => v.id === 'portacontenedor')!
const DECK = PORTA.alto   // 1208 mm de plataforma sobre riel

function Escena({ onModelo }: { onModelo: (m: ModeloCG35) => void }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const capas = useFerro((s) => s.capasCG)
  const explotado = useFerro((s) => s.explotadoCG)
  const sobreVagon = useFerro((s) => s.sobreVagon)
  const abiertas = useFerro((s) => s.compuertasAbiertas)
  const seleccionar = useFerro((s) => s.seleccionarCG)
  const [objetivo, setObjetivo] = useState<{ obj: THREE.Mesh } | null>(null)

  const modelo = useMemo(() => construirCG35(), [])
  useEffect(() => { onModelo(modelo) }, [modelo, onModelo])

  /* El vagón se construye una sola vez y se muestra u oculta. */
  const vagon = useMemo(() => construirVagon(PORTA, modelo.materiales), [modelo])
  useEffect(() => { vagon.root.visible = sobreVagon }, [vagon, sobreVagon])

  /* Al montarlo, el contenedor sube hasta la plataforma. */
  const alturaObjetivo = sobreVagon ? DECK * 0.001 : 0
  useFrame((_, dt) => {
    const y = modelo.root.position.y
    if (Math.abs(y - alturaObjetivo) > 0.002) {
      modelo.root.position.y = y + (alturaObjetivo - y) * Math.min(1, dt * 3.4)
    }
    /* Apertura de compuertas: giran sobre su bisagra. */
    const ang = abiertas ? 1.15 : 0
    for (const c of modelo.compuertas) {
      const meta = c.userData.lado as number
      const obj = ang * meta
      if (Math.abs(c.rotation.z - obj) > 0.004) {
        c.rotation.z += (obj - c.rotation.z) * Math.min(1, dt * 4)
      }
    }
  })

  useEffect(() => {
    for (const c of CATS_CG35) {
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
      <primitive object={vagon.root} />
      <Contorno objetivo={objetivo} planos={planos} />
    </>
  )
}

function Camara({ radio, controls }: { radio: number; controls: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  const anim = useRef<{ p0: THREE.Vector3; p1: THREE.Vector3; t: number } | null>(null)
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const p1 = new THREE.Vector3(0.68, 0.46, 0.86).normalize().multiplyScalar(radio * 2.7)
    p1.y += 0.4
    anim.current = { p0: camera.position.clone(), p1, t: 0 }
    c.target.set(0, radio * 0.32, 0)
  }, [radio, camera, controls])
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

export default function VisorCG35() {
  const controls = useRef<any>(null)
  const [modelo, setModelo] = useState<ModeloCG35 | null>(null)
  const sobreVagon = useFerro((s) => s.sobreVagon)
  /* Con el vagón, el conjunto pasa de 6 a 12,4 m: hay que abrir el encuadre. */
  const R = (modelo?.radio ?? 4) * (sobreVagon ? 1.75 : 1)

  return (
    <Canvas
      shadows dpr={[1, 1.7]}
      camera={{ fov: 32, near: 0.05, far: 300, position: [8, 6, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance', localClippingEnabled: true }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = null
      }}
    >
      <Entorno presentacion />
      <Luces d={R * 2.6} presentacion />
      <Escena onModelo={setModelo} />
      <ContactShadows position={[0, 0, 0]} scale={R * 3} blur={2.3} opacity={0.52} far={6} resolution={1024} />
      <gridHelper args={[R * 6, 24, 0x2a3038, 0x1c2128]} position={[0, -0.003, 0]} />
      <Camara radio={R} controls={controls} />
      <OrbitControls ref={controls} enableDamping dampingFactor={0.07}
        minDistance={2} maxDistance={R * 7} maxPolarAngle={Math.PI * 0.495} makeDefault />
    </Canvas>
  )
}
