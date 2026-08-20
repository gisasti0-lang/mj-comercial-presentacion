import * as THREE from 'three'

/* ── Texturas procedurales: perfilería de chapa ─────────────────── */
function stripeNormal(period: number, kind: 'onda' | 'trapecio', size = 512) {
  const c = document.createElement('canvas')
  c.width = size; c.height = 8
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, 8)
  for (let x = 0; x < size; x++) {
    const u = (x % period) / period
    let slope: number
    if (kind === 'onda') {
      slope = Math.cos(u * Math.PI * 2)
    } else {
      // perfil trapezoidal T101: meseta / rampa / meseta / rampa
      if (u < 0.30) slope = 0
      else if (u < 0.44) slope = 1
      else if (u < 0.62) slope = 0
      else if (u < 0.76) slope = -1
      else slope = 0
    }
    const nx = slope * 0.62
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx))
    for (let y = 0; y < 8; y++) {
      const i = (y * size + x) * 4
      img.data[i] = (nx * 0.5 + 0.5) * 255
      img.data[i + 1] = 127
      img.data[i + 2] = nz * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

/* ── Ruido sutil para hormigón / terreno ────────────────────────── */
function grain(size = 256, amount = 14) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    const v = 128 + (Math.random() - 0.5) * amount
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export interface Materiales {
  chapaOndulada: THREE.MeshStandardMaterial
  chapaLisa: THREE.MeshStandardMaterial
  chapaInterior: THREE.MeshStandardMaterial
  cubierta: THREE.MeshStandardMaterial
  acero: THREE.MeshStandardMaterial
  aceroClaro: THREE.MeshStandardMaterial
  reja: THREE.MeshStandardMaterial
  piso: THREE.MeshStandardMaterial
  hormigon: THREE.MeshStandardMaterial
  vidrio: THREE.MeshPhysicalMaterial
  interior: THREE.MeshStandardMaterial
  colchon: THREE.MeshStandardMaterial
  sanitario: THREE.MeshStandardMaterial
  fantasma: THREE.MeshStandardMaterial
  dispose(): void
}

export function crearMateriales(): Materiales {
  const nOnda = stripeNormal(26, 'onda')
  const nT101 = stripeNormal(46, 'trapecio')
  const nGrain = grain(256, 6)

  const all: (THREE.Material | THREE.Texture)[] = [nOnda, nT101, nGrain]
  const reg = <T extends THREE.Material>(m: T): T => { all.push(m); return m }

  const chapaOndulada = reg(new THREE.MeshStandardMaterial({
    color: 0x8f9499, metalness: 0.62, roughness: 0.52,
    normalMap: nOnda, normalScale: new THREE.Vector2(1.35, 1.35),
    side: THREE.DoubleSide,
  }))
  const chapaLisa = reg(new THREE.MeshStandardMaterial({
    color: 0x969b9f, metalness: 0.6, roughness: 0.48, side: THREE.DoubleSide,
  }))
  const chapaInterior = reg(new THREE.MeshStandardMaterial({
    color: 0xb4b7b8, metalness: 0.42, roughness: 0.62, side: THREE.DoubleSide,
  }))
  const cubierta = reg(new THREE.MeshStandardMaterial({
    color: 0x9aa0a4, metalness: 0.72, roughness: 0.4,
    normalMap: nT101, normalScale: new THREE.Vector2(1.5, 1.5),
    side: THREE.DoubleSide,
  }))
  const acero = reg(new THREE.MeshStandardMaterial({
    color: 0x3b3f44, metalness: 0.82, roughness: 0.44,
  }))
  const aceroClaro = reg(new THREE.MeshStandardMaterial({
    color: 0x5a6067, metalness: 0.78, roughness: 0.42,
  }))
  const reja = reg(new THREE.MeshStandardMaterial({
    color: 0x2e3237, metalness: 0.86, roughness: 0.38,
  }))
  const piso = reg(new THREE.MeshStandardMaterial({
    color: 0x7f8489, metalness: 0.5, roughness: 0.68, side: THREE.DoubleSide,
  }))
  const hormigon = reg(new THREE.MeshStandardMaterial({
    color: 0x6d6f70, metalness: 0.02, roughness: 0.94,
    normalMap: nGrain, normalScale: new THREE.Vector2(0.3, 0.3),
  }))
  const vidrio = reg(new THREE.MeshPhysicalMaterial({
    color: 0x1a2026, metalness: 0, roughness: 0.14,
    transmission: 0.72, thickness: 0.02, transparent: true, opacity: 0.55,
    side: THREE.DoubleSide,
  }))
  const interior = reg(new THREE.MeshStandardMaterial({
    color: 0xc9ccce, metalness: 0.2, roughness: 0.78, side: THREE.DoubleSide,
  }))
  const colchon = reg(new THREE.MeshStandardMaterial({
    color: 0x9ea3a6, metalness: 0.0, roughness: 0.92,
  }))
  const sanitario = reg(new THREE.MeshStandardMaterial({
    color: 0xd8dbdc, metalness: 0.35, roughness: 0.35,
  }))
  const fantasma = reg(new THREE.MeshStandardMaterial({
    color: 0x8d9296, metalness: 0.1, roughness: 0.9,
    transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide,
  }))

  return {
    chapaOndulada, chapaLisa, chapaInterior, cubierta, acero, aceroClaro, reja,
    piso, hormigon, vidrio, interior, colchon, sanitario, fantasma,
    dispose() { all.forEach((m) => m.dispose()) },
  }
}

/* Aplica los planos de corte a todos los materiales del set */
export function aplicarCorte(m: Materiales, planes: THREE.Plane[]) {
  Object.values(m).forEach((v) => {
    if (v instanceof THREE.Material) {
      v.clippingPlanes = planes.length ? planes : null
      v.clipShadows = true
      v.needsUpdate = true
    }
  })
}

/* ── Entorno procedural (sin dependencias de red) ───────────────────
   Equirectangular generado en canvas: cielo, horizonte, suelo y un sol
   suave. Da reflejos creíbles al acero sin descargar ningún HDR.      */
export function entornoEquirect(presentacion: boolean): THREE.Texture {
  const w = 512, h = 256
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, 0, h)
  if (presentacion) {
    g.addColorStop(0.00, '#2d3f57')
    g.addColorStop(0.34, '#7d8ea3')
    g.addColorStop(0.49, '#d8c3a5')
    g.addColorStop(0.52, '#5b5348')
    g.addColorStop(1.00, '#241f1b')
  } else {
    g.addColorStop(0.00, '#5a6570')
    g.addColorStop(0.46, '#9aa3ab')
    g.addColorStop(0.52, '#4d545b')
    g.addColorStop(1.00, '#2a2f34')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // sol / fuente principal difusa
  const sx = presentacion ? w * 0.72 : w * 0.5
  const sy = presentacion ? h * 0.36 : h * 0.28
  const r = presentacion ? 92 : 130
  const s = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
  s.addColorStop(0, presentacion ? 'rgba(255,244,222,.95)' : 'rgba(255,255,255,.55)')
  s.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = s
  ctx.fillRect(0, 0, w, h)

  const t = new THREE.CanvasTexture(c)
  t.mapping = THREE.EquirectangularReflectionMapping
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}
