import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, HomeIcon, InventoryIcon, LoginIcon, UserIcon } from '../components/Icons';

const paths = [
  {
    to: '/register/buyer',
    role: 'Buyer',
    icon: UserIcon,
    title: 'Source as a buyer',
    body: 'Browse the Greige Floor, save boards, ask Warp, and place mill orders.',
    points: ['Cloth Passports & Warp', 'Collection boards', 'Order studio'],
  },
  {
    to: '/register/supplier',
    role: 'Supplier',
    icon: InventoryIcon,
    title: 'List as a mill',
    body: 'Publish inventory, manage the order pipeline, and keep your mill profile current.',
    points: ['Inventory catalog', 'Order pipeline', 'Mill profile'],
  },
];

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(125deg, #12141a 0%, #1a3654 55%, #2a3344 100%)',
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-14 text-linen md:px-6">
        <Link to="/welcome" className="font-display text-4xl tracking-[0.06em]">
          GREIGE
        </Link>
        <p className="mt-3 max-w-xl text-linen/75">
          Create an account to unlock sourcing tools — choose how you use the marketplace.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {paths.map((path, i) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Link
                  to={path.to}
                  className="group flex h-full flex-col border border-linen/20 bg-linen/[0.06] p-6 transition hover:border-linen/45 hover:bg-linen/[0.1]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-linen/55">
                      {path.role}
                    </span>
                    <Icon className="h-5 w-5 text-linen/70" />
                  </div>
                  <h1 className="mt-4 font-display text-3xl leading-tight">{path.title}</h1>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-linen/70">{path.body}</p>
                  <ul className="mt-5 space-y-1.5 text-sm text-linen/80">
                    {path.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="h-1 w-1 bg-linen/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex w-full items-center justify-between gap-2 border border-linen/35 bg-linen/10 px-4 py-2.5 text-sm font-medium text-linen transition group-hover:border-linen/55 group-hover:bg-linen/15">
                    Continue as {path.role.toLowerCase()}
                    <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 space-y-3 border-t border-linen/15 pt-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-linen/55">Already with GREIGE?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-between gap-2 border border-linen/30 bg-linen/10 px-4 py-3 text-sm font-medium text-linen transition hover:border-linen/55 hover:bg-linen/15"
            >
              <span className="inline-flex items-center gap-2">
                <LoginIcon className="h-4 w-4" />
                Sign in
              </span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-between gap-2 border border-linen/30 bg-linen/10 px-4 py-3 text-sm font-medium text-linen transition hover:border-linen/55 hover:bg-linen/15"
            >
              <span className="inline-flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                Browse Greige Floor
              </span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
