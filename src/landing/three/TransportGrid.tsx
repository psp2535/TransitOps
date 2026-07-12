import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GridLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  )
}

function LightTrail({ path, speed, color }: { path: THREE.Vector3[]; speed: number; color: string }) {
  const trailRef = useRef<THREE.Mesh>(null)
  const progress = useRef(Math.random())

  useFrame((_, delta) => {
    if (!trailRef.current || path.length < 2) return

    progress.current += delta * speed
    if (progress.current > 1) progress.current = 0

    const idx = Math.floor(progress.current * (path.length - 1))
    const nextIdx = Math.min(idx + 1, path.length - 1)
    const t = (progress.current * (path.length - 1)) % 1

    const pos = new THREE.Vector3().lerpVectors(path[idx], path[nextIdx], t)
    trailRef.current.position.copy(pos)
  })

  return (
    <mesh ref={trailRef}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  )
}

export default function TransportGrid() {
  const gridSize = 20
  const divisions = 16
  const step = gridSize / divisions
  const half = gridSize / 2
  const y = -4

  const lines = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number] }[] = []
    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * step
      result.push({
        start: [pos, y, -half],
        end: [pos, y, half],
      })
      result.push({
        start: [-half, y, pos],
        end: [half, y, pos],
      })
    }
    return result
  }, [])

  const trails = useMemo(() => {
    const result = []
    const colors = ['#00d4ff', '#8b5cf6', '#3b82f6', '#22d3ee', '#6366f1']

    for (let i = 0; i < 12; i++) {
      const isHorizontal = Math.random() > 0.5
      const fixedPos = -half + Math.floor(Math.random() * divisions) * step
      const path: THREE.Vector3[] = []

      for (let j = 0; j <= 20; j++) {
        const t = (j / 20) * gridSize - half
        if (isHorizontal) {
          path.push(new THREE.Vector3(t, y + 0.02, fixedPos))
        } else {
          path.push(new THREE.Vector3(fixedPos, y + 0.02, t))
        }
      }

      result.push({
        path,
        speed: 0.15 + Math.random() * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    return result
  }, [])

  return (
    <group>
      {lines.map((line, i) => (
        <GridLine key={i} start={line.start} end={line.end} color="#1e3a5f" />
      ))}
      {trails.map((trail, i) => (
        <LightTrail key={`trail-${i}`} path={trail.path} speed={trail.speed} color={trail.color} />
      ))}
      {/* Grid center glow */}
      <mesh position={[0, y - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[gridSize * 1.5, gridSize * 1.5]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.03}
        />
      </mesh>
    </group>
  )
}
