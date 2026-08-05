import { motion } from 'framer-motion';

const bolts = [
  { x: '8%', y: '18%', w: 120, h: 180, rotate: -12, color: '#c4baa8', delay: 1.1 },
  { x: '22%', y: '42%', w: 100, h: 160, rotate: 8, color: '#1a3654', delay: 1.25 },
  { x: '72%', y: '16%', w: 130, h: 200, rotate: 14, color: '#d8c9b0', delay: 1.35 },
  { x: '84%', y: '48%', w: 110, h: 170, rotate: -8, color: '#5c6b4a', delay: 1.45 },
  { x: '58%', y: '58%', w: 95, h: 150, rotate: 4, color: '#8a8680', delay: 1.55 },
];

/**
 * Full-bleed fabric atmosphere:
 * 1) Macro weave zoom-out (thread lines → cloth)
 * 2) Sourcing-floor bolts floating into view
 */
export default function FabricHeroMotion({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Base mill wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(125deg, #12141a 0%, #1a3654 48%, #2a3344 78%, #c4c0b6 100%)',
        }}
      />

      {/* Stage 1 — weave macro zoom */}
      <motion.div
        className="absolute inset-[-20%] origin-center"
        initial={{ scale: 14, opacity: 1 }}
        animate={{ scale: 1, opacity: 0.55 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="fabric-weave-macro absolute inset-0" />
        <div className="fabric-weft-macro absolute inset-0 opacity-70" />
      </motion.div>

      {/* Soft cloth plane after zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.1 }}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(245,244,241,0.12), transparent 70%)',
        }}
      />

      {/* Stage 2 — sourcing floor bolts */}
      {bolts.map((bolt) => (
        <motion.div
          key={`${bolt.x}-${bolt.y}`}
          className="absolute hidden sm:block"
          style={{
            left: bolt.x,
            top: bolt.y,
            width: bolt.w,
            height: bolt.h,
          }}
          initial={{ opacity: 0, y: 40, scale: 0.85, rotate: bolt.rotate - 6 }}
          animate={{
            opacity: 0.55,
            y: [0, -10, 0],
            scale: 1,
            rotate: bolt.rotate,
          }}
          transition={{
            opacity: { delay: bolt.delay, duration: 0.7 },
            scale: { delay: bolt.delay, duration: 0.7 },
            rotate: { delay: bolt.delay, duration: 0.7 },
            y: {
              delay: bolt.delay + 0.7,
              duration: 5.5 + bolt.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <div
            className="h-full w-full shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            style={{
              background: `linear-gradient(160deg, ${bolt.color} 0%, ${bolt.color}cc 45%, #e2dfd8 100%)`,
              transform: `rotate(${bolt.rotate}deg)`,
            }}
          >
            <div className="fabric-weave-fine h-full w-full opacity-40" />
          </div>
        </motion.div>
      ))}

      {/* Hand / browse cue — soft sweep across cloths */}
      <motion.div
        className="absolute left-[10%] top-[55%] hidden h-px w-[45%] md:block"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(245,244,241,0.45), transparent)',
        }}
        initial={{ opacity: 0, x: -40, scaleX: 0.4 }}
        animate={{ opacity: [0, 0.7, 0], x: [0, 80, 160], scaleX: [0.4, 1, 0.6] }}
        transition={{ delay: 2.2, duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }}
      />

      {/* Continuous slow weave drift */}
      <div className="fabric-drift absolute inset-0 opacity-25" />

      {/* Readability veil for brand type */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/40" />
    </div>
  );
}
