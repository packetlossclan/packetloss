"use client";

import { useRef, useEffect } from "react";

interface StarfieldProps {
  intensity?: number;
}

export function Starfield({ intensity = 1 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const stars = Array.from({ length: Math.floor(120 * intensity) }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.00008 + 0.00002,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      if (!canvas || !ctx) return;
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y -= s.speed;
        if (s.y < 0) {
          s.y = 1;
          s.x = Math.random();
        }
        const twinkle =
          0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.opacity * (0.6 + 0.4 * twinkle);
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199,204,221,${opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
