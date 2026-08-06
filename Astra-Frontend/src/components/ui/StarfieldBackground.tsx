import { useEffect, useRef } from 'react';

// Props: none
export default function StarfieldBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stars = Array.from({ length: 250 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.2, o: Math.random(), d: Math.random() * 0.01 }));
    type ShootingStar = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      length: number;
      width: number;
      delay: number;
      active: boolean;
    };
    const createShot = (): ShootingStar => ({
      x: -100,
      y: -100,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      length: 0,
      width: 0,
      delay: 500 + Math.random() * 4000,
      active: false,
    });
    const resetShot = (shot: ShootingStar) => {
      // Spawn in top half and travel diagonally down-right for a realistic meteor pass.
      shot.x = -80 + Math.random() * (canvas.width * 0.5);
      shot.y = -40 + Math.random() * (canvas.height * 0.45);
      const angle = ((22 + Math.random() * 14) * Math.PI) / 180;
      const speed = 520 + Math.random() * 380;
      shot.vx = Math.cos(angle) * speed;
      shot.vy = Math.sin(angle) * speed;
      shot.length = 120 + Math.random() * 120;
      shot.width = 1.2 + Math.random() * 1.4;
      shot.life = 0;
      shot.maxLife = 0.45 + Math.random() * 0.45;
      shot.active = true;
    };
    const shots = Array.from({ length: 3 }, () => createShot());
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    let raf = 0;
    let last = performance.now();
    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.o += s.d;
        if (s.o > 1 || s.o < 0.2) s.d *= -1;
        ctx.globalAlpha = s.o;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      shots.forEach((sh) => {
        if (!sh.active) {
          sh.delay -= dt * 1000;
          if (sh.delay <= 0) resetShot(sh);
          return;
        }

        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        const t = sh.life / sh.maxLife;
        const alpha = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
        const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.length;
        const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.length;
        const gradient = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
        gradient.addColorStop(0.25, `rgba(120,220,255,${0.55 * alpha})`);
        gradient.addColorStop(1, 'rgba(120,220,255,0)');

        ctx.globalAlpha = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;
        ctx.lineWidth = sh.width;
        ctx.shadowColor = 'rgba(140, 240, 255, 0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (t >= 1 || sh.x > canvas.width + 160 || sh.y > canvas.height + 120) {
          sh.active = false;
          sh.delay = 1200 + Math.random() * 5000;
          ctx.shadowBlur = 0;
        }
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" />;
}
