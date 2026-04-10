import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import asteroidsAPI from '@/api/asteroids.api';

/* ── Earth with texture ── */
function Earth() {
  const ref = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, 'https://cdn.jsdelivr.net/gh/turban/Webgl-Earth/images/2_no_clouds_4k.jpg');

  useFrame((_, dt) => {
    ref.current.rotation.y += 0.001;
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial map={texture} shininess={15} />
      </mesh>
      {/* Atmosphere shell */}
      <mesh>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.15} side={THREE.FrontSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Starfield ── */
function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const r = 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation />
    </points>
  );
}

/* ── Single asteroid object ── */
interface AsteroidObjProps {
  name: string;
  hazardous: boolean;
  missDistanceKm: number;
  diameterMax: number;
  velocityKmS: number;
  approachDate: string;
  onClick: () => void;
}

function AsteroidObj({ name, hazardous, missDistanceKm, diameterMax, velocityKmS, approachDate, onClick }: AsteroidObjProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const [hovered, setHovered] = useState(false);

  // Scale orbit radius from miss distance (normalize to visual range)
  const orbitRadius = Math.max(1.8, Math.min(missDistanceKm / 1_000_000, 8));
  // Scale asteroid size from diameter (normalize)
  const asteroidSize = Math.max(0.04, Math.min(diameterMax * 2, 0.2));

  // Orbit path
  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 90; i++) {
      const t = (i / 90) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * orbitRadius, 0, Math.sin(t) * orbitRadius * 0.65));
    }
    return pts;
  }, [orbitRadius]);

  // Move asteroid along orbit
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.3;
    ref.current.position.set(
      Math.cos(t) * orbitRadius,
      0,
      Math.sin(t) * orbitRadius * 0.65
    );
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;

    // Pulse light for hazardous
    if (hazardous && lightRef.current) {
      lightRef.current.intensity = 0.4 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  const color = hazardous ? '#ff4444' : '#e8f4ff';

  return (
    <group>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[asteroidSize, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={hazardous ? '#ff4444' : '#4488ff'}
          emissiveIntensity={hazardous ? 0.3 : 0.1}
        />
      </mesh>

      {/* Pulsing red light for hazardous */}
      {hazardous && (
        <pointLight
          ref={lightRef}
          color="#ff4444"
          intensity={0.5}
          distance={3}
        />
      )}

      {/* Orbit line */}
      <Line
        points={orbitPoints}
        color={hazardous ? '#ff444430' : '#ffffff15'}
        lineWidth={1}
        dashed
        dashSize={0.15}
        gapSize={0.15}
      />

      {/* Hover label */}
      {hovered && (
        <mesh position={[ref.current?.position.x || 0, (ref.current?.position.y || 0) + 0.3, ref.current?.position.z || 0]}>
          <sphereGeometry args={[0.01]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
}

/* ── Info panel overlay ── */
interface InfoPanelProps {
  asteroid: {
    name: string;
    hazardous: boolean;
    velocityKmS: number;
    missDistanceKm: number;
    approachDate: string;
    diameterMax: number;
  } | null;
  onClose: () => void;
}

function InfoPanel({ asteroid, onClose }: InfoPanelProps) {
  if (!asteroid) return null;
  return (
    <div
      className="absolute top-4 right-4 rounded-xl p-4 w-64 z-10"
      style={{
        background: 'rgba(6,13,24,0.95)',
        border: asteroid.hazardous ? '1px solid var(--hazard)' : '1px solid #ffffff15',
        boxShadow: asteroid.hazardous ? 'var(--glow-hazard)' : 'var(--glow-card)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{asteroid.name}</h3>
        <button
          onClick={onClose}
          className="text-xs px-1"
          style={{ color: 'var(--text-dim)' }}
        >
          ✕
        </button>
      </div>

      {asteroid.hazardous && (
        <div
          className="text-[10px] font-bold mb-2 px-2 py-0.5 rounded-full inline-block"
          style={{ background: 'var(--hazard-dim)', color: 'var(--hazard)', letterSpacing: '0.08em' }}
        >
          ⚠ HAZARDOUS
        </div>
      )}

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-dim)' }}>Speed</span>
          <span style={{ color: 'var(--cyan)' }}>{asteroid.velocityKmS.toFixed(1)} km/s</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-dim)' }}>Miss Distance</span>
          <span style={{ color: 'var(--cyan)' }}>{(asteroid.missDistanceKm / 1_000_000).toFixed(1)}M km</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-dim)' }}>Approach</span>
          <span style={{ color: 'var(--text-secondary)' }}>{new Date(asteroid.approachDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-dim)' }}>Diameter</span>
          <span style={{ color: 'var(--text-secondary)' }}>{asteroid.diameterMax < 1 ? `${Math.round(asteroid.diameterMax * 1000)}m` : `${asteroid.diameterMax.toFixed(1)}km`}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Loading fallback ── */
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#1a6eb5" />
    </mesh>
  );
}

/* ── Scene content (inside Canvas) ── */
function SceneContent({ onAsteroidClick }: { onAsteroidClick: (a: any) => void }) {
  const [asteroids, setAsteroids] = useState<any[]>([]);

  useEffect(() => {
    asteroidsAPI.getFeed({ limit: 10 })
      .then((response) => {
        const items = (response.asteroids || []).map((a: any) => ({
          nasaId: a.nasaId || a.neo_reference_id || a.id,
          name: a.name,
          hazardous: a.isPotentiallyHazardous || a.is_potentially_hazardous_asteroid || false,
          missDistanceKm: a.closeApproaches?.[0]?.missDistanceKm || a.close_approach_data?.[0]?.miss_distance?.kilometers || 1_500_000,
          diameterMax: a.estimatedDiameterMax || a.estimated_diameter?.kilometers?.estimated_diameter_max || 0.1,
          velocityKmS: a.closeApproaches?.[0]?.velocityKmS || a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 10,
          approachDate: a.closeApproaches?.[0]?.date || a.close_approach_data?.[0]?.close_approach_date || new Date().toISOString(),
        }));
        setAsteroids(items);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <color attach="background" args={['#020408']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[8, 5, -5]} intensity={1.2} color="#ffcc55" />

      <Suspense fallback={<LoadingFallback />}>
        <Earth />
      </Suspense>

      <Starfield />

      {asteroids.map((asteroid, i) => (
        <AsteroidObj
          key={asteroid.nasaId || i}
          name={asteroid.name}
          hazardous={asteroid.hazardous}
          missDistanceKm={Number(asteroid.missDistanceKm) || 1_500_000}
          diameterMax={Number(asteroid.diameterMax) || 0.1}
          velocityKmS={Number(asteroid.velocityKmS) || 10}
          approachDate={asteroid.approachDate}
          onClick={() => onAsteroidClick(asteroid)}
        />
      ))}

      <OrbitControls
        minDistance={1.5}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

/* ── Main OrbitScene component ── */
export default function OrbitScene() {
  const [selectedAsteroid, setSelectedAsteroid] = useState<any>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <SceneContent onAsteroidClick={setSelectedAsteroid} />
      </Canvas>

      {/* Info panel overlay */}
      <InfoPanel asteroid={selectedAsteroid} onClose={() => setSelectedAsteroid(null)} />

      {/* Instructions overlay */}
      {!selectedAsteroid && (
        <div
          className="absolute bottom-4 left-4 rounded-lg px-3 py-2 text-xs"
          style={{ background: 'rgba(6,13,24,0.8)', color: 'var(--text-dim)', border: '1px solid #ffffff08' }}
        >
          Drag to rotate · Scroll to zoom · Click asteroid for details
        </div>
      )}
    </div>
  );
}