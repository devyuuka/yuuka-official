import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { scrollTrack } from '../hooks/useLenisScroll';

function makeSoftCircleTexture() {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.42, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.75, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export function ThreeAtmosphere() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 0, 10);

    // 220 luminous drifting sky/breeze motes reacting to scroll velocity with strong 緩急
    const count = 220;
    const positions = new Float32Array(count * 3);
    const baseCoords = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    const palette = [
      new THREE.Color('#38bdf8'), // clear sky cyan
      new THREE.Color('#60a5fa'), // azure
      new THREE.Color('#93c5fd'), // ice blue
      new THREE.Color('#f472b6'), // faint sakura twilight
    ];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 10;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      baseCoords[i * 3] = x;
      baseCoords[i * 3 + 1] = y;
      baseCoords[i * 3 + 2] = z;
      phases[i] = Math.random() * Math.PI * 2;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const tex = makeSoftCircleTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.36,
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Subtle undulating translucent 3D breeze wave ribbon
    const curvePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      curvePts.push(
        new THREE.Vector3((u - 0.5) * 18, Math.sin(u * Math.PI * 2.5) * 1.8, -2)
      );
    }
    const waveCurve = new THREE.CatmullRomCurve3(curvePts);
    const waveGeo = new THREE.TubeGeometry(waveCurve, 120, 0.032, 8, false);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    scene.add(waveMesh);

    let px = 0;
    let py = 0;
    let spx = 0;
    let spy = 0;
    let smoothVel = 0;

    const onPointerMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      const rawVel = THREE.MathUtils.clamp(scrollTrack.velocity, -70, 70);
      smoothVel += (rawVel - smoothVel) * 0.1;
      const absVel = Math.abs(smoothVel);

      spx += (px - spx) * 0.05;
      spy += (py - spy) * 0.05;

      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const ph = phases[i];
        baseCoords[i * 3 + 1] += 0.004 + smoothVel * 0.0032;
        if (baseCoords[i * 3 + 1] > 6.5) baseCoords[i * 3 + 1] = -6.5;
        if (baseCoords[i * 3 + 1] < -6.5) baseCoords[i * 3 + 1] = 6.5;

        arr[i * 3] = baseCoords[i * 3] + Math.sin(t * 0.6 + ph) * (0.25 + absVel * 0.015);
        arr[i * 3 + 1] = baseCoords[i * 3 + 1];
        arr[i * 3 + 2] = baseCoords[i * 3 + 2] + Math.cos(t * 0.5 + ph) * 0.25;
      }
      posAttr.needsUpdate = true;

      waveMesh.position.y = Math.sin(scrollTrack.progress * Math.PI * 2) * 1.4;
      waveMesh.rotation.z = smoothVel * 0.004 + Math.sin(t * 0.4) * 0.06;
      waveMesh.rotation.x = scrollTrack.progress * 0.8;

      camera.position.x = spx * 0.65;
      camera.position.y = spy * 0.45;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      mat.dispose();
      tex.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
    />
  );
}
