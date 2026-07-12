import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ParticleField from './ParticleField'
import TransportGrid from './TransportGrid'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[5, 3, 5]} intensity={0.3} color="#3b82f6" />

      <ParticleField count={400} />
      <TransportGrid />

      {/* Floating geometric elements */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[6, 2, -3]}>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[-7, 3, -2]}>
          <icosahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[4, -1, -4]}>
          <torusGeometry args={[0.3, 0.1, 8, 20]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.25}
            wireframe
          />
        </mesh>
      </Float>

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 60 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
