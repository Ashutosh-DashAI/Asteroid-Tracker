import React from 'react';

// Props: children, className, glowColor, padding, onClick
export default function GlassCard({
  children,
  className = '',
  glowColor = 'var(--neon-cyan)',
  padding = 'p-4',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  padding?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${padding} rounded-2xl transition duration-300 hover:scale-[1.01] interactive-glow ${className}`}
      style={{ boxShadow: `0 0 24px color-mix(in srgb, ${glowColor} 24%, transparent)` }}
    >
      {children}
    </div>
  );
}
