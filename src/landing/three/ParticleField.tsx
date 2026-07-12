import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField({ count = 500 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const positions = []
    const speeds = []
    for (let i = 0; i < count; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 25,
        z: (Math.random() - 0.5) * 20 - 5,
        baseY: (Math.random() - 0.5) * 25,
      })
      speeds.push({
        drift: Math.random() * 0.002 + 0.001,
        float: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return { positions, speeds }
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const p = particles.positions[i]
      const s = particles.speeds[i]

      dummy.position.set(
        p.x + Math.sin(t * s.drift * 50 + s.phase) * 0.5,
        p.baseY + Math.sin(t * s.float + s.phase) * 1.5,
        p.z + Math.cos(t * s.drift * 30 + s.phase) * 0.3
      )

      const scale = 0.02 + Math.sin(t * 1.5 + s.phase) * 0.01
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
    </instancedMesh>
  )
}
