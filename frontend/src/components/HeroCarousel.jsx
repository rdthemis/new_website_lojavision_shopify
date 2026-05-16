import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1758525223709-2dc38e53f55d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHx5b3V0aGZ1bCUyMGxpZmVzdHlsZSUyMHNob3BwaW5nJTIwcGFzdGVsfGVufDB8fHx8MTc3ODkwNTk2Mnww&ixlib=rb-4.1.0&q=85",
    accent: "#FF574D",
  },
  {
    image:
      "https://images.unsplash.com/photo-1649083048381-520a5b3d91ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBob21lJTIwZGVjb3IlMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
    accent: "#FF574D",
  },
  {
    image:
      "https://images.unsplash.com/photo-1774773135752-c72ccb1a0b5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHx0cmVuZHklMjB5b3V0aCUyMGZhc2hpb24lMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
    accent: "#FF574D",
  },
];

const AUTO_MS = 6500;

const HeroCarousel = ({ onCta, onSecondary }) => {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_MS);
    return () => clearInterval(id);
  }, [paused]);

  const go = (dir) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[index];
  const titles = t.hero.titles;
  const subs = t.hero.subtitles;

  return (
    <section
      data-testid="hero-carousel"
      className="relative w-[95%] mx-auto mt-4 rounded-3xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ aspectRatio: "16/8" }}
    >
      {/* Image layer with Ken-Burns slow zoom */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`img-${index}`}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 2.6, ease: EASE }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text overlay */}
      <div className="relative z-10 h-full flex items-end p-8 md:p-14 lg:p-20">
        <div className="max-w-2xl">
          <motion.span
            key={`eyebrow-${index}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
            className="inline-block text-xs tracking-[0.25em] uppercase font-semibold text-white/85 bg-white/10 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 mb-5"
            data-testid={`hero-eyebrow-${index}`}
          >
            {t.hero.eyebrow}
          </motion.span>

          <motion.h1
            key={`title-${index}`}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-white"
            data-testid={`hero-title-${index}`}
          >
            {titles[index]}
          </motion.h1>

          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
            className="mt-5 text-base md:text-lg text-white/85 max-w-xl"
            data-testid={`hero-subtitle-${index}`}
          >
            {subs[index]}
          </motion.p>

          <motion.div
            key={`cta-${index}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.75 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <button
              data-testid="hero-cta-primary"
              onClick={onCta}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:translate-y-[-1px]"
              style={{ backgroundColor: "#FF574D" }}
            >
              {t.hero.cta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={onSecondary}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/15 transition-colors"
            >
              {t.hero.secondary}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute z-20 right-6 bottom-6 md:right-10 md:bottom-10 flex items-center gap-2">
        <button
          data-testid="hero-prev"
          onClick={() => go(-1)}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          data-testid="hero-next"
          onClick={() => go(1)}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute z-20 left-6 bottom-6 md:left-10 md:bottom-10 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            data-testid={`hero-dot-${i}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === index ? 28 : 10,
              backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
