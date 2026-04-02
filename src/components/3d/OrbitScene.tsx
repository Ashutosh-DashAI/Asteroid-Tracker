import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Earth() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.25; });
  return (
    <>
      <mesh ref={ref}><sphereGeometry args={[1, 48, 48]} /><meshStandardMaterial color="#1a6eb5" roughness={0.8} emissive="#123a7a" emissiveIntensity={0.2} /></mesh>
      <mesh><sphereGeometry args={[1.08, 32, 32]} /><meshBasicMaterial color="#4cc3ff" transparent opacity={0.15} /></mesh>
    </>
  );
}

function Asteroid({ missDistanceKm = 1_500_000 }: { missDistanceKm?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const radius = Math.max(1.6, missDistanceKm / 1_500_000);
  const points = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const t = (i / 90) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius * 0.65);
  }), [radius]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.45;
    ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius * 0.65);
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
  });
  return (
    <>
      <mesh ref={ref}><dodecahedronGeometry args={[0.15, 0]} /><meshStandardMaterial color="#8f7f6d" roughness={0.9} /></mesh>
      <Line points={points} color="#eab308" dashed dashSize={0.1} gapSize={0.1} />
    </>
  );
}

export default function OrbitScene({ asteroid }: { asteroid?: any }) {
  return (
    <div className="glass-card h-[420px] rounded-2xl">
      <Canvas camera={{ position: [3, 2, 5] }}>
        <color attach="background" args={['#05060c']} />
        <ambientLight intensity={0.25} />
        <pointLight position={[8, 5, -5]} intensity={1.2} color="#ffcc55" />
        <Earth />
        <Asteroid missDistanceKm={Number(asteroid?.missDistanceKm || 1_500_000)} />
        <OrbitControls minDistance={1.5} maxDistance={20} />
      </Canvas>
    </div>
  );
}
