import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; dx: number; dy: number; life: number; color: string };

export function Celebration({ reduced, onClose }: { reduced: boolean; onClose(): void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    if (reduced) return () => window.removeEventListener("keydown", closeOnEscape);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return () => window.removeEventListener("keydown", closeOnEscape);
    const colors = ["--seg-morning", "--seg-afternoon", "--seg-evening"].map((key) => getComputedStyle(document.documentElement).getPropertyValue(key));
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles: Particle[] = Array.from({ length: 160 }, (_, index) => ({
      x: canvas.width * (index % 2 ? 0.3 : 0.7),
      y: canvas.height * 0.35,
      dx: (Math.random() - 0.5) * 12,
      dy: -Math.random() * 12 - 3,
      life: 1,
      color: colors[index % colors.length],
    }));
    const started = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += 0.18;
        particle.life -= 0.012;
        context.globalAlpha = Math.max(particle.life, 0);
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 4, 4);
      });
      if (now - started < 2500) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, reduced]);
  return <section className="celebration" data-testid="celebration" onClick={onClose} role="presentation">
    {!reduced && <canvas aria-hidden="true" ref={canvasRef} />}
    <div className="celebration-message" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
      <h2>Congratulations!</h2>
      <p>오늘 할 일을 다 끝냈어요</p>
      <button autoFocus onClick={onClose} type="button">닫기</button>
    </div>
  </section>;
}
