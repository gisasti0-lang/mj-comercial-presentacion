import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { Materiales } from './materials'
import { useFerro } from '../storeFerro'

/**
 * Aplica el corte activo a los materiales de un modelo ferroviario.
 * Calcula el plano sobre la caja envolvente real del modelo, de modo que la
 * posición del corte signifique lo mismo en el bogie, el vagón o el contenedor.
 */
export function useCorte(root: THREE.Object3D | null, materiales: Materiales | null) {
  const corte = useFerro((s) => s.corte)
  const [planos, setPlanos] = useState<THREE.Plane[]>([])

  useEffect(() => {
    if (!root || !materiales) return
    const bbox = new THREE.Box3().setFromObject(root)
    const lista: THREE.Plane[] = []

    if (corte.activo && !bbox.isEmpty()) {
      const min = corte.eje === 'x' ? bbox.min.x : corte.eje === 'y' ? bbox.min.y : bbox.min.z
      const max = corte.eje === 'x' ? bbox.max.x : corte.eje === 'y' ? bbox.max.y : bbox.max.z
      const v = min + (max - min) * corte.pos
      const n = new THREE.Vector3(
        corte.eje === 'x' ? -1 : 0, corte.eje === 'y' ? -1 : 0, corte.eje === 'z' ? -1 : 0,
      )
      if (corte.invertido) n.negate()
      lista.push(new THREE.Plane(n, corte.invertido ? -v : v))
    }

    setPlanos(lista)
    Object.values(materiales as unknown as Record<string, unknown>).forEach((m) => {
      if (m instanceof THREE.Material) {
        m.clippingPlanes = lista.length ? lista : null
        m.clipShadows = true
        m.needsUpdate = true
      }
    })
  }, [corte, root, materiales])

  return planos
}
