import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function Globe() {
  const globeRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!globeRef.current) return
    globeRef.current.rotation.y = clock.getElapsedTime() * 0.08
  })

  return (
    <group ref={globeRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2.5, 36, 36]} />
        <meshStandardMaterial
          color="#0a1628"
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>

      {/* Glowing outer shell */}
      <mesh>
        <sphereGeometry args={[2.52, 36, 36]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Latitude/longitude lines */}
      <mesh>
        <sphereGeometry args={[2.55, 16, 16]} />
        <meshBasicMaterial
          color="#1e3a5f"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </group>
  )
}

function ConnectionArc({ start, end, color }: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
}) {
  const curveRef = useRef<THREE.Line>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const progress = useRef(Math.random())

  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const dist = startVec.distanceTo(endVec)
    mid.normalize().multiplyScalar(2.5 + dist * 0.3)

    return new THREE.QuadraticBezierCurve3(startVec, mid, endVec)
  }, [start, end])

  const points = useMemo(() => curve.getPoints(50), [curve])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  useFrame((_, delta) => {
    if (!dotRef.current) return
    progress.current += delta * 0.3
    if (progress.current > 1) progress.current = 0
    const pos = curve.getPoint(progress.current)
    dotRef.current.position.copy(pos)
  })

  return (
    <group>
      <line ref={curveRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </line>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function NodePoint({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.3
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function GlobeScene() {
  // Positions on sphere surface (lat/lon converted to 3D)
  const latLonToPos = (lat: number, lon: number, r: number = 2.5): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return [
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    ]
  }

  const cities = useMemo(() => [
    { name: 'NYC', lat: 40.7, lon: -74 },
    { name: 'London', lat: 51.5, lon: -0.1 },
    { name: 'Tokyo', lat: 35.7, lon: 139.7 },
    { name: 'Sydney', lat: -33.9, lon: 151.2 },
    { name: 'Dubai', lat: 25.2, lon: 55.3 },
    { name: 'Mumbai', lat: 19.1, lon: 72.9 },
    { name: 'SF', lat: 37.8, lon: -122.4 },
    { name: 'Singapore', lat: 1.3, lon: 103.8 },
  ], [])

  const connections = useMemo(() => [
    { from: 0, to: 1, color: '#00d4ff' },
    { from: 1, to: 3, color: '#8b5cf6' },
    { from: 0, to: 6, color: '#3b82f6' },
    { from: 4, to: 5, color: '#22d3ee' },
    { from: 2, to: 7, color: '#00d4ff' },
    { from: 1, to: 4, color: '#6366f1' },
    { from: 5, to: 2, color: '#8b5cf6' },
    { from: 6, to: 2, color: '#3b82f6' },
  ], [])

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#00d4ff" />
      <pointLight position={[-5, -3, 5]} intensity={0.2} color="#8b5cf6" />

      <Globe />

      {cities.map((city, i) => (
        <NodePoint
          key={i}
          position={latLonToPos(city.lat, city.lon)}
          color="#00d4ff"
        />
      ))}

      {connections.map((conn, i) => (
        <ConnectionArc
          key={i}
          start={latLonToPos(cities[conn.from].lat, cities[conn.from].lon)}
          end={latLonToPos(cities[conn.to].lat, cities[conn.to].lon)}
          color={conn.color}
        />
      ))}

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function GlobeNetwork() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <GlobeScene />
    </Canvas>
  )
}
