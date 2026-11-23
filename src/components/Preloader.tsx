import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '../utils/motion';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('out'), 460);
    const t2 = window.setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1020);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          animate={
            phase === 'out'
              ? { clipPath: 'inset(0% 0% 100% 0%)' }
              : { clipPath: 'inset(0% 0% 0% 0%)' }
          }
          transition={{ duration: 0.56, ease: EASE.whip }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#ffffff] text-slate-900"
        >
          <div className="overflow-hidden py-2">
            <motion.span
              initial={{ y: '115%' }}
              animate={phase === 'out' ? { y: '-115%' } : { y: '0%' }}
              transition={{ duration: 0.48, ease: EASE.whip }}
              className="inline-block text-3xl font-bold tracking-[0.06em] sm:text-4xl"
            >
              ゆうか
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
