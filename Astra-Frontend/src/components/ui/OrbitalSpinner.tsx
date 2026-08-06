// Props: size, fullScreen
export default function OrbitalSpinner({ size = 40, fullScreen = false }: { size?: number; fullScreen?: boolean }) {
  const spinner = (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 border-t-cyan-300" style={{ animation: 'orbitalSpin 1s linear infinite' }} />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300" style={{ animation: 'dotPulse 1s ease infinite' }} />
    </div>
  );
  if (!fullScreen) return spinner;
  return <div className="flex min-h-[40vh] items-center justify-center">{spinner}</div>;
}
