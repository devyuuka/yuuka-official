import { motion } from 'framer-motion';
import { scrollToTarget } from '../hooks/useLenisScroll';
import { EASE } from '../utils/motion';

interface NavbarProps {
  inTwilight: boolean;
}

const LINKS = [
  { label: 'ことば', href: '#story' },
  { label: '得意な言語', href: '#skills' },
  { label: '作る予定', href: '#planned' },
  { label: 'リンク', href: '#links' },
];

export function Navbar({ inTwilight }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.72, delay: 0.8, ease: EASE.expoOut }}
      className="pointer-events-none fixed left-0 right-0 top-5 z-50 flex justify-center px-4"
    >
      <nav
        className={`pointer-events-auto flex items-center gap-6 rounded-full border px-6 py-2.5 backdrop-blur-xl transition-colors duration-500 sm:gap-8 sm:px-7 ${
          inTwilight
            ? 'border-white/15 bg-[#0e1a36]/70 text-white'
            : 'border-slate-900/10 bg-white/80 text-slate-900'
        }`}
      >
        <button
          type="button"
          onClick={() => scrollToTarget(0, 1.25)}
          className="text-sm font-bold tracking-[0.04em] transition-opacity hover:opacity-70"
        >
          ゆうか
        </button>

        <div className="hidden items-center gap-6 sm:flex">
          {LINKS.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollToTarget(item.href, 1.15)}
              className={`text-xs font-medium transition-colors ${
                inTwilight
                  ? 'text-white/75 hover:text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}
