import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FabricHeroMotion from '../components/FabricHeroMotion';
import { ArrowRightIcon, LoginIcon } from '../components/Icons';

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FabricHeroMotion />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-end px-4 pb-16 pt-10 text-linen md:justify-center md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className="font-display text-6xl tracking-[0.06em] md:text-8xl"
        >
          GREIGE
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.65 }}
          className="mt-4 max-w-lg text-lg text-linen/85 md:text-xl"
        >
          From the loom, before the finish. Mill-true fabrics for buyers who source by hand-feel,
          GSM, and cloth — not SKU noise.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.05, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link to="/" className="inline-flex items-center gap-2 bg-linen px-6 py-3 text-ink">
            Browse Greige Floor
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            to="/register/buyer"
            className="inline-flex items-center gap-2 border border-linen/50 px-6 py-3 text-linen"
          >
            Register as buyer
          </Link>
          <Link
            to="/register/supplier"
            className="inline-flex items-center gap-2 border border-linen/50 px-6 py-3 text-linen"
          >
            Register as mill
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 border border-linen/50 px-6 py-3 text-linen"
          >
            <LoginIcon className="h-4 w-4" />
            Sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
