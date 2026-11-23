import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_CONTENT } from '../data/profile';
import { scrollToTarget, scrollTrack } from '../hooks/useLenisScroll';
import { EASE, SPRING } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

interface PhotoGallerySiteProps {
  ready: boolean;
  onTwilightChange: (inTwilight: boolean) => void;
}

export function PhotoGallerySite({
  ready,
  onTwilightChange,
}: PhotoGallerySiteProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const skillsPinRef = useRef<HTMLElement>(null);
  const plannedPinRef = useRef<HTMLElement>(null);
  const plannedTiltRef = useRef<HTMLDivElement>(null);

  const [activeSkillIdx, setActiveSkillIdx] = useState(0);
  const [activePlannedIdx, setActivePlannedIdx] = useState(0);

  // Subtle 3D window-depth tilt driven by pointer + scroll velocity on the #planned cinema stage!
  useEffect(() => {
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      const velTilt = Math.max(-3.5, Math.min(3.5, scrollTrack.velocity * 0.055));
      if (plannedTiltRef.current) {
        plannedTiltRef.current.style.transform = `perspective(1400px) rotateY(${cx * 3.2}deg) rotateX(${-cy * 2.4 + velTilt}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. HERO: Dramatic scroll zoom into the sunlit window + frame expansion
      gsap.to('.hero-zoom-img', {
        scale: 1.24,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.55,
        },
      });

      // 2. STORY: Visual-first opposite-direction parallax strips + quiet caption reveal
      gsap.fromTo(
        '.story-strip-left',
        { y: 110, scale: 1.08, rotate: -2 },
        {
          y: -90,
          scale: 1,
          rotate: 1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '#story',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        '.story-strip-right',
        { y: -70, scale: 1.12, rotate: 2 },
        {
          y: 105,
          scale: 1,
          rotate: -1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '#story',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        '.story-line-pop',
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '#story',
            start: 'top 72%',
            end: 'top 30%',
            scrub: 0.65,
          },
        }
      );

      // 3. SKILLS: PINNED FULL-BLEED ARTWORK WIPE STAGE (4 visuals stacked with dramatic 緩急!)
      if (skillsPinRef.current) {
        const layers = gsap.utils.toArray<HTMLElement>('.skill-layer');
        const imgs = gsap.utils.toArray<HTMLElement>('.skill-layer-img');
        const captions = gsap.utils.toArray<HTMLElement>('.skill-layer-caption');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: skillsPinRef.current,
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.55,
            onUpdate: (self) => {
              const p = self.progress;
              const idx = p < 0.24 ? 0 : p < 0.54 ? 1 : p < 0.82 ? 2 : 3;
              setActiveSkillIdx(idx);
              onTwilightChange(idx >= 2);
            },
            onLeave: () => onTwilightChange(true),
            onLeaveBack: () => onTwilightChange(false),
          },
        });

        tl.addLabel('skill-0', 0);
        // Initial subtle zoom drift on layer 0
        tl.to(imgs[0], { scale: 1.06, duration: 0.3, ease: 'none' }, 0);

        // Layers 1, 2, 3 wipe smoothly upward with crisp 緩急 and zero dark dead zones!
        for (let i = 1; i < layers.length; i++) {
          const at = (i - 1) * 1.05 + 0.3;
          // Outgoing visual recedes softly backward while staying brightly visible
          tl.to(
            layers[i - 1],
            {
              scale: 0.91,
              yPercent: -4,
              filter: 'brightness(0.76)',
              duration: 0.78,
              ease: 'power3.inOut',
            },
            at + 0.04
          );
          tl.to(
            captions[i - 1],
            {
              opacity: 0,
              y: -16,
              duration: 0.25,
              ease: 'power2.in',
            },
            at
          );
          // Incoming artwork rises cleanly from a rounded clip-path to full-bleed
          tl.fromTo(
            layers[i],
            {
              clipPath: 'inset(100% 6% 0% 6% round 48px)',
              yPercent: 8,
            },
            {
              clipPath: 'inset(0% 0% 0% 0% round 32px)',
              yPercent: 0,
              duration: 0.78,
              ease: 'power3.inOut',
            },
            at
          );
          // Internal photograph snaps from zoomed-in to wide composition
          tl.fromTo(
            imgs[i],
            { scale: 1.28 },
            { scale: 1.02, duration: 0.88, ease: 'expo.out' },
            at
          );
          // Quiet supporting caption glides in cleanly right as the wipe lands
          tl.fromTo(
            captions[i],
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.36, ease: 'expo.out' },
            at + 0.36
          );
          tl.addLabel(`skill-${i}`, at + 0.84);
        }
        // Gentle hold on the final artwork so it stays full-bleed before unpinning
        tl.to(imgs[layers.length - 1], { scale: 1.06, duration: 0.35, ease: 'none' });
      }

      // 4. PLANNED WORKS: PINNED CINEMATIC PORTAL EXPANSION -> FULL-SCREEN WHIP TRANSITION!
      if (plannedPinRef.current) {
        const portal = plannedPinRef.current.querySelector('.planned-portal');
        const img0 = plannedPinRef.current.querySelector('.planned-img-0');
        const cap0 = plannedPinRef.current.querySelector('.planned-cap-0');
        const layer0 = plannedPinRef.current.querySelector('.planned-layer-0');
        const layer1 = plannedPinRef.current.querySelector('.planned-layer-1');
        const img1 = plannedPinRef.current.querySelector('.planned-img-1');
        const cap1 = plannedPinRef.current.querySelector('.planned-cap-1');

        const ptl = gsap.timeline({
          scrollTrigger: {
            trigger: plannedPinRef.current,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.65,
            onEnter: () => onTwilightChange(true),
            onEnterBack: () => onTwilightChange(true),
            onLeave: () => onTwilightChange(false),
            onUpdate: (self) => {
              setActivePlannedIdx(self.progress > 0.5 ? 1 : 0);
            },
          },
        });

        // Beat 1: Compact rounded portal EXPLODES smoothly into a breathtaking full-bleed cinema canvas!
        ptl
          .fromTo(
            portal,
            {
              scale: 0.66,
              borderRadius: '64px',
            },
            {
              scale: 1,
              borderRadius: '32px',
              duration: 0.9,
              ease: 'expo.inOut',
            },
            0
          )
          .fromTo(
            img0,
            { scale: 1.38 },
            { scale: 1.04, duration: 1.0, ease: 'expo.out' },
            0
          )
          .fromTo(
            cap0,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' },
            0.35
          )
          // Brief breath on the starry desk artwork
          .to(img0, { scale: 1.09, duration: 0.45, ease: 'none' }, 1.0)
          // Beat 2: Desktop artwork tilts & recedes backward while Twilight Skyline WHIPS across horizontally!
          .to(
            layer0,
            {
              scale: 0.84,
              xPercent: -10,
              rotate: -2.2,
              filter: 'brightness(0.45)',
              duration: 0.95,
              ease: 'expo.inOut',
            },
            1.45
          )
          .to(
            cap0,
            { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' },
            1.45
          )
          .fromTo(
            layer1,
            {
              clipPath: 'inset(14% 0% 14% 100% round 56px)',
              scale: 1.06,
            },
            {
              clipPath: 'inset(0% 0% 0% 0% round 32px)',
              scale: 1,
              duration: 0.95,
              ease: 'expo.inOut',
            },
            1.45
          )
          .fromTo(
            img1,
            { scale: 1.38, xPercent: 8 },
            { scale: 1.02, xPercent: 0, duration: 1.05, ease: 'expo.out' },
            1.45
          )
          .fromTo(
            cap1,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' },
            1.88
          )
          // Lingering serene sky drift before unpinning
          .to(img1, { scale: 1.08, duration: 0.45, ease: 'none' }, 2.5);
      }
    }, rootRef);

    return () => ctx.revert();
  }, [onTwilightChange]);

  const chars = SITE_CONTENT.name.split('');

  const jumpToSkill = (idx: number) => {
    if (!skillsPinRef.current) return;
    const st = ScrollTrigger.getAll().find((t) => t.trigger === skillsPinRef.current);
    if (st) {
      const targetY = st.labelToScroll(`skill-${idx}`);
      if (typeof targetY === 'number' && !Number.isNaN(targetY)) {
        scrollToTarget(targetY, 0.9);
      }
    }
  };

  const jumpToPlanned = (idx: number) => {
    if (!plannedPinRef.current) return;
    const st = ScrollTrigger.getAll().find((t) => t.trigger === plannedPinRef.current);
    if (st) {
      const ratio = idx === 0 ? 0.34 : 0.88;
      const targetY = st.start + (st.end - st.start) * ratio;
      scrollToTarget(targetY, 1.05);
    }
  };

  return (
    <div ref={rootRef} className="relative z-20 w-full bg-[#ffffff] text-slate-900">
      {/* 1. HERO — Massive Rounded Sunlit Window Canvas */}
      <section id="top" className="w-full px-3 pt-20 pb-6 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ scale: 0.84, opacity: 0, borderRadius: '56px' }}
          animate={ready ? { scale: 1, opacity: 1, borderRadius: '32px' } : {}}
          transition={{ duration: 1.05, ease: EASE.whip }}
          className="relative mx-auto flex min-h-[86vh] w-full max-w-[1440px] flex-col justify-end overflow-hidden rounded-[32px] bg-sky-100"
        >
          <img
            src="./images/hero-sky.jpg"
            alt="青空と窓辺のグラス"
            className="hero-zoom-img absolute inset-0 h-full w-full object-cover object-center will-change-transform"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091f3d]/55 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col justify-between gap-6 p-7 sm:p-12 md:flex-row md:items-end md:p-14">
            <div>
              <h1 className="flex select-none items-baseline">
                {chars.map((ch, idx) => (
                  <span key={idx} className="inline-block overflow-hidden py-2">
                    <motion.span
                      initial={{ y: '115%' }}
                      animate={ready ? { y: '0%' } : {}}
                      whileHover={{ y: -14, scaleY: 1.15, scaleX: 0.92 }}
                      transition={{
                        ...SPRING.elastic,
                        y: {
                          duration: 0.9,
                          delay: ready ? 0.14 + idx * 0.08 : 0,
                          ease: EASE.whip,
                        },
                      }}
                      className="inline-block text-6xl font-bold tracking-[-0.02em] text-white sm:text-8xl md:text-[7rem]"
                    >
                      {ch}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={ready ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.85, delay: 0.36, ease: EASE.expoOut }}
                className="mt-3 text-sm font-medium text-white/90 sm:text-base"
              >
                {SITE_CONTENT.heroCaption}
              </motion.p>
            </div>

            <motion.button
              type="button"
              initial={{ y: 18, opacity: 0 }}
              animate={ready ? { y: 0, opacity: 1 } : {}}
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ ...SPRING.tactile, opacity: { delay: 0.48, duration: 0.7 } }}
              onClick={() => scrollToTarget('#story', 1.15)}
              className="w-fit rounded-full bg-white/90 px-6 py-3 text-xs font-bold text-slate-900 backdrop-blur-md transition-colors hover:bg-white sm:text-sm"
            >
              下へスクロール ↓
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 2. STORY — Expressive Mid-Sentence Typography + Floating Parallax Photos */}
      <section
        id="story"
        className="relative overflow-hidden px-4 py-28 sm:px-8 sm:py-44"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dff3ff]/75 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="story-strip-left overflow-hidden rounded-[32px] lg:col-span-3">
            <img
              src="./images/desk-craft.jpg"
              alt="朝の光が差す白いデスク"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>

          <div className="mx-auto max-w-2xl px-2 py-6 text-center lg:col-span-6">
            <p className="story-line-pop text-lg font-medium leading-[2.3] text-slate-700 sm:text-xl sm:leading-[2.4]">
              まだ
              <span className="mx-1.5 inline-block text-3xl font-bold tracking-[-0.02em] text-slate-950 sm:text-5xl">
                完成した作品
              </span>
              は
              <span className="mx-1.5 inline-block text-2xl font-bold text-slate-900 sm:text-4xl">
                ありません。
              </span>
            </p>

            <p className="story-line-pop mt-6 text-lg font-medium leading-[2.3] text-slate-700 sm:text-xl sm:leading-[2.4]">
              これから
              <span className="mx-1.5 inline-block text-3xl font-bold tracking-[-0.02em] text-sky-600 sm:text-5xl">
                デスクトップアプリ
              </span>
              と
              <span className="mx-1.5 inline-block text-3xl font-bold tracking-[-0.02em] text-blue-600 sm:text-5xl">
                Webサービス
              </span>
              を、
            </p>

            <p className="story-line-pop mt-6 text-lg font-medium leading-[2.3] text-slate-700 sm:text-xl sm:leading-[2.4]">
              触っていて心地いいかたちで
              <span className="mx-1.5 inline-block text-3xl font-bold tracking-[-0.02em] text-slate-950 sm:text-4xl">
                少しずつ届けていきます。
              </span>
            </p>
          </div>

          <div className="story-strip-right overflow-hidden rounded-[32px] lg:col-span-3">
            <img
              src="./images/water-prism.jpg"
              alt="水面の波紋とガラス"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. SKILLS — PINNED FULL-BLEED ARTWORK WIPE STAGE (絵が全面・文字は補助情報!) */}
      <section
        id="skills"
        ref={skillsPinRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#ffffff] px-3 py-20 sm:px-6 sm:py-24"
      >
        <div className="relative h-full w-full max-w-[1440px] overflow-hidden rounded-[32px] bg-slate-950">
          {SITE_CONTENT.skills.map((skill, idx) => (
            <div
              key={skill.id}
              style={{ zIndex: idx + 1 }}
              className="skill-layer absolute inset-0 overflow-hidden rounded-[32px] will-change-transform"
            >
              <img
                src={skill.image}
                alt={skill.name}
                className="skill-layer-img h-full w-full object-cover object-center will-change-transform"
              />

              {/* Delicate natural edge scrim so compact supporting caption always reads effortlessly */}
              <div
                className={`pointer-events-none absolute inset-0 ${
                  skill.darkOverlay
                    ? 'bg-gradient-to-t from-[#071024]/75 via-transparent to-transparent'
                    : 'bg-gradient-to-t from-slate-950/55 via-transparent to-transparent'
                }`}
              />

              {/* Compact Supporting Info Overlay (Bottom-Left) */}
              <div className="skill-layer-caption absolute bottom-7 left-7 right-7 z-10 flex flex-col items-start justify-between gap-4 sm:bottom-11 sm:left-11 sm:right-11 md:flex-row md:items-end">
                <div className="rounded-3xl bg-white/15 px-6 py-4 backdrop-blur-xl">
                  <div className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
                    {skill.name}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-white/90 sm:text-sm">
                    {skill.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Interactive Compact Rounded Language Switcher (Bottom-Right) */}
          <div className="absolute bottom-7 right-7 z-30 hidden items-center gap-2 rounded-full bg-slate-950/35 p-1.5 backdrop-blur-xl sm:bottom-11 sm:right-11 md:flex">
            {SITE_CONTENT.skills.map((skill, idx) => {
              const active = idx === activeSkillIdx;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => jumpToSkill(idx)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                    active
                      ? 'bg-white text-slate-950'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PLANNED WORKS — PINNED FULL-SCREEN PORTAL BLOOM & HORIZONTAL WHIP CINEMA */}
      <section
        id="planned"
        ref={plannedPinRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#091229] via-[#0e1c3f] to-[#14234a] px-3 py-20 sm:px-6 sm:py-24"
      >
        <div
          ref={plannedTiltRef}
          className="h-full w-full max-w-[1440px] will-change-transform"
        >
          <div className="planned-portal relative h-full w-full overflow-hidden rounded-[32px] bg-[#071024] will-change-transform">
            {/* Artwork 1: Desktop App (Full-Bleed Starry Night Desk) */}
            <div className="planned-layer-0 absolute inset-0 z-10 overflow-hidden rounded-[32px] will-change-transform">
              <img
                src={SITE_CONTENT.planned[0].image}
                alt={SITE_CONTENT.planned[0].title}
                className="planned-img-0 h-full w-full object-cover object-center will-change-transform"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060d1f]/80 via-[#060d1f]/15 to-transparent" />

              {/* Compact Supporting Caption */}
              <div className="planned-cap-0 absolute bottom-7 left-7 z-10 max-w-md rounded-3xl bg-white/12 px-6 py-5 backdrop-blur-xl sm:bottom-12 sm:left-12">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                    {SITE_CONTENT.planned[0].title}
                  </h2>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-sky-100">
                    {SITE_CONTENT.planned[0].status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-blue-50/90 sm:text-sm">
                  {SITE_CONTENT.planned[0].caption}（{SITE_CONTENT.planned[0].stack}）
                </p>
              </div>
            </div>

            {/* Artwork 2: Web Service (Full-Bleed Magic-Hour Twilight Skyline Whips Across!) */}
            <div className="planned-layer-1 absolute inset-0 z-20 overflow-hidden rounded-[32px] will-change-transform">
              <img
                src={SITE_CONTENT.planned[1].image}
                alt={SITE_CONTENT.planned[1].title}
                className="planned-img-1 h-full w-full object-cover object-center will-change-transform"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a132c]/80 via-[#0a132c]/15 to-transparent" />

              {/* Compact Supporting Caption */}
              <div className="planned-cap-1 absolute bottom-7 left-7 z-10 max-w-md rounded-3xl bg-white/14 px-6 py-5 backdrop-blur-xl sm:bottom-12 sm:left-12">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                    {SITE_CONTENT.planned[1].title}
                  </h2>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-pink-100">
                    {SITE_CONTENT.planned[1].status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-white/90 sm:text-sm">
                  {SITE_CONTENT.planned[1].caption}（{SITE_CONTENT.planned[1].stack}）
                </p>
              </div>
            </div>

            {/* Compact Rounded Switcher (Bottom-Right) */}
            <div className="absolute bottom-7 right-7 z-30 hidden items-center gap-2 rounded-full bg-slate-950/40 p-1.5 backdrop-blur-xl sm:bottom-12 sm:right-12 md:flex">
              {SITE_CONTENT.planned.map((work, idx) => {
                const active = idx === activePlannedIdx;
                return (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => jumpToPlanned(idx)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                      active
                        ? 'bg-white text-slate-950'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {work.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER — Clean Minimal Rounded Strip */}
      <footer id="links" className="bg-[#ffffff] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 rounded-[32px] bg-[#f1f7ff] px-7 py-8 sm:flex-row sm:items-center sm:px-12 sm:py-10">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-lg font-bold text-slate-950">ゆうか</span>
            <div className="flex flex-wrap items-center gap-2">
              {SITE_CONTENT.links.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  whileHover={{ y: -2 }}
                  transition={SPRING.tactile}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-blue-600 hover:text-white sm:text-sm"
                >
                  {link.label} ↗
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} ゆうか
            </span>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING.tactile}
              onClick={() => scrollToTarget(0, 1.35)}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-600"
            >
              一番上へ ↑
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}
