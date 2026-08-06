import OrbitScene from '@/components/3d/OrbitScene';

export default function OrbitViewer() {
  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          3D View
        </h1>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Interactive orbital visualization of near-Earth asteroids
      </p>
      <OrbitScene />
    </div>
  );
}