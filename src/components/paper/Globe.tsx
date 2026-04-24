"use client";

import { useEffect, useRef } from "react";

interface GlobeProps {
  size?: number;
}

interface LandDot { lat: number; lon: number; }
interface Particle { t: number; speed: number; }
interface GlobeState {
  rot: number;
  manualRot: number;
  isDragging: boolean;
  lastX: number;
  particles: Particle[] | null;
  landDots: LandDot[] | null;
}

export function Globe({ size = 400 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const stateRef = useRef<GlobeState>({
    rot: 0,
    manualRot: 0,
    isDragging: false,
    lastX: 0,
    particles: null,
    landDots: null,
  });

  // Pre-generate land dots + particles once
  useEffect(() => {
    const state = stateRef.current;
    const LAND: [number, number, number, number, number][] = [
      [25, 75, -125, -65, 160],
      [-55, 10, -80, -35, 100],
      [35, 70, -10, 40, 100],
      [-35, 37, -18, 51, 180],
      [10, 70, 40, 150, 220],
      [-40, -10, 115, 155, 55],
      [60, 83, -180, 180, 45],
    ];
    state.landDots = LAND.flatMap(([la0, la1, lo0, lo1, n]) =>
      Array.from({ length: n }, () => ({
        lat: la0 + Math.random() * (la1 - la0),
        lon: lo0 + Math.random() * (lo1 - lo0),
      }))
    );
    const connections = [[0, 1], [0, 2], [0, 4], [0, 3], [1, 7], [1, 8], [2, 3], [3, 5], [4, 7], [4, 6], [5, 9], [3, 9], [8, 10], [2, 11]];
    state.particles = connections.map(() => ({ t: Math.random(), speed: 0.0012 + Math.random() * 0.0018 }));
  }, []);

  // Drag handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    const getX = (e: MouseEvent | TouchEvent): number => {
      if ("clientX" in e) return e.clientX;
      return e.touches?.[0]?.clientX ?? s.lastX;
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      s.isDragging = true;
      s.lastX = getX(e);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!s.isDragging) return;
      const x = getX(e);
      s.manualRot += (x - s.lastX) * 0.35;
      s.lastX = x;
    };
    const onUp = () => { s.isDragging = false; };
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.41;

    const cities = [
      { lat: -1.9, lon: 30.1 }, { lat: -1.3, lon: 36.8 }, { lat: 6.5, lon: 3.4 },
      { lat: 51.5, lon: -0.1 }, { lat: 25.2, lon: 55.3 }, { lat: 40.7, lon: -74.0 },
      { lat: 1.3, lon: 103.8 }, { lat: 30.1, lon: 31.2 }, { lat: -26.2, lon: 28.0 },
      { lat: 48.9, lon: 2.3 }, { lat: -33.9, lon: 18.4 }, { lat: 55.8, lon: 37.6 },
    ];
    const connections: [number, number][] = [[0, 1], [0, 2], [0, 4], [0, 3], [1, 7], [1, 8], [2, 3], [3, 5], [4, 7], [4, 6], [5, 9], [3, 9], [8, 10], [2, 11]];
    const arcColors: [number, number, number][] = [[79, 70, 229], [13, 148, 136], [79, 70, 229], [180, 83, 9], [79, 70, 229], [13, 148, 136], [79, 70, 229], [180, 83, 9], [13, 148, 136], [79, 70, 229], [13, 148, 136], [180, 83, 9], [79, 70, 229], [13, 148, 136]];

    const s = stateRef.current;

    function proj(lat: number, lon: number) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + s.rot + s.manualRot) * Math.PI / 180;
      return { x3: Math.sin(phi) * Math.cos(theta), y3: Math.cos(phi), z3: Math.sin(phi) * Math.sin(theta) };
    }
    function toXY(x3: number, y3: number, lift = 1) {
      return { x: cx + R * x3 * lift, y: cy - R * y3 * lift };
    }
    function arcPoints(a: { lat: number; lon: number }, b: { lat: number; lon: number }, lift = 0.2, steps = 64) {
      return Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        const lat = a.lat + (b.lat - a.lat) * t;
        const lon = a.lon + (b.lon - a.lon) * t;
        const { x3, y3, z3 } = proj(lat, lon);
        const el = 1 + lift * Math.sin(t * Math.PI);
        return { ...toXY(x3, y3, el), z3 };
      });
    }

    function draw(ts: number) {
      if (!ctx) return;
      if (!s.isDragging) s.rot = ts * 0.008;
      ctx.clearRect(0, 0, size, size);

      // Atmosphere halo
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
      atmo.addColorStop(0, "rgba(79,70,229,0.12)");
      atmo.addColorStop(1, "transparent");
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Sphere fill
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      const base = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R * 1.05);
      base.addColorStop(0, "rgba(210,220,255,0.95)");
      base.addColorStop(0.5, "rgba(185,200,250,0.97)");
      base.addColorStop(1, "rgba(155,175,235,1)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, size, size);

      // Specular highlight
      const spec = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, 0, cx, cy, R);
      spec.addColorStop(0, "rgba(255,255,255,0.35)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.04)");
      spec.addColorStop(1, "transparent");
      ctx.fillStyle = spec;
      ctx.fillRect(0, 0, size, size);

      // Limb darkening
      const limb = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
      limb.addColorStop(0, "transparent");
      limb.addColorStop(0.7, "rgba(0,0,0,0.04)");
      limb.addColorStop(1, "rgba(0,0,50,0.5)");
      ctx.fillStyle = limb;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();

      // Sphere edge
      ctx.strokeStyle = "rgba(79,70,229,0.45)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(79,70,229,0.3)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Grid lines
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 0.5, 0, Math.PI * 2);
      ctx.clip();
      for (let lat = -80; lat <= 80; lat += 20) {
        const phi = (90 - lat) * Math.PI / 180;
        const ry = R * Math.cos(phi);
        const rx = R * Math.sin(phi);
        if (rx < 2) continue;
        ctx.strokeStyle = "rgba(100,120,220,0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - ry, rx, rx * 0.13, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 15) {
        const pts = Array.from({ length: 30 }, (_, i) => {
          const lat = -85 + i * 170 / 29;
          const { x3, y3, z3 } = proj(lat, lon);
          return { ...toXY(x3, y3), z3 };
        });
        ctx.lineWidth = 0.4;
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i];
          const q = pts[i + 1];
          const az = (p.z3 + q.z3) / 2;
          if (az < 0) continue;
          ctx.strokeStyle = `rgba(80,100,210,${az * 0.1})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Land dots
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      ctx.clip();
      (s.landDots || []).forEach((d) => {
        const { x3, y3, z3 } = proj(d.lat, d.lon);
        if (z3 < 0.04) return;
        const { x, y } = toXY(x3, y3, 0.997);
        const r2 = 0.8 + z3 * 0.7;
        const bright = 0.3 + z3 * 0.5;
        ctx.fillStyle = `rgba(60,90,200,${bright * 0.42})`;
        ctx.beginPath();
        ctx.arc(x, y, r2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Arcs + particles
      connections.forEach(([ai, bi], idx) => {
        const [r2, g2, b2] = arcColors[idx];
        const pts = arcPoints(cities[ai], cities[bi]);
        const vis = pts.filter((p) => p.z3 > -0.05);
        if (!vis.length) return;
        [{ w: 7, a: 0.06 }, { w: 2.5, a: 0.2 }, { w: 1, a: 0.65 }].forEach(({ w, a }) => {
          ctx.strokeStyle = `rgba(${r2},${g2},${b2},${a})`;
          ctx.lineWidth = w;
          ctx.beginPath();
          let on = false;
          pts.forEach((p) => {
            if (p.z3 < -0.05) {
              on = false;
              return;
            }
            if (!on) {
              ctx.moveTo(p.x, p.y);
              on = true;
            } else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        });
        if (s.particles) {
          const par = s.particles[idx];
          par.t = (par.t + par.speed) % 1;
          const pi = Math.floor(par.t * pts.length);
          const pt = pts[Math.min(pi, pts.length - 1)];
          if (pt && pt.z3 > 0.05) {
            for (let k = 0; k < 8; k++) {
              const tp = pts[Math.max(0, pi - k)];
              if (!tp || tp.z3 < 0) continue;
              ctx.fillStyle = `rgba(${r2},${g2},${b2},${((8 - k) / 8) * 0.55})`;
              ctx.beginPath();
              ctx.arc(tp.x, tp.y, ((8 - k) / 8) * 2.8, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowColor = `rgba(${r2},${g2},${b2},.8)`;
            ctx.shadowBlur = 12;
            ctx.fillStyle = `rgba(${r2},${g2},${b2},1)`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // City nodes
      cities.forEach((city, ci) => {
        const { x3, y3, z3 } = proj(city.lat, city.lon);
        if (z3 < 0.05) return;
        const { x, y } = toXY(x3, y3);
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.003 + ci * 1.3);
        ctx.strokeStyle = `rgba(99,102,241,${0.12 + pulse * 0.22})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(79,70,229,0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowColor = "rgba(79,70,229,.9)";
        ctx.shadowBlur = 7;
        ctx.fillStyle = "#4F46E5";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [size]);

  return <canvas ref={canvasRef} style={{ display: "block", cursor: "grab" }} title="Drag to rotate" />;
}
