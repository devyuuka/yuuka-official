import { useCallback, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLenisScroll } from './hooks/useLenisScroll';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { ThreeAtmosphere } from './components/ThreeAtmosphere';
import { PhotoGallerySite } from './components/PhotoGallerySite';

export function App() {
  useLenisScroll();

  const [ready, setReady] = useState(false);
  const [inTwilight, setInTwilight] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 210,
    damping: 26,
    restDelta: 0.001,
  });

  const handleReady = useCallback(() => setReady(true), []);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#ffffff] text-slate-900">
      {/* Subtle sky-blue scroll progress line */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-sky-400 via-blue-500 to-pink-400"
      />

      <Preloader onComplete={handleReady} />
      <Navbar inTwilight={inTwilight} />

      {/* Three.js Scroll-Velocity Luminous Atmosphere Particles & Wave */}
      <ThreeAtmosphere />

      <main>
        <PhotoGallerySite
          ready={ready}
          onTwilightChange={setInTwilight}
        />
      </main>
    </div>
  );
}

export default App;
