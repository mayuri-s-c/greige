import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWarpStore } from '../store/warpStore';
import WarpPanel from '../components/WarpPanel';
import WarpIcon from '../components/WarpIcon';
import SiteFooter from '../components/SiteFooter';
import {
  BoardIcon,
  CartIcon,
  HomeIcon,
  LoginIcon,
  LogoutIcon,
  SampleIcon,
  UserIcon,
} from '../components/Icons';

const nav = [
  { to: '/', label: 'Floor', end: true, icon: HomeIcon },
  { to: '/match', label: 'Match', icon: SampleIcon },
  { to: '/boards', label: 'Boards', icon: BoardIcon },
  { to: '/cart', label: 'Cart', icon: CartIcon },
  { to: '/dashboard', label: 'Studio', icon: UserIcon },
];

export default function BuyerLayout() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const openWarp = useWarpStore((s) => s.openWarp);
  const warpOpen = useWarpStore((s) => s.open);
  const location = useLocation();
  const navigate = useNavigate();
  const isGuest = !token || !user;

  useEffect(() => {
    if (!isGuest) fetchCart();
    else useCartStore.getState().reset();
  }, [fetchCart, isGuest]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const count = cart?.items?.length || 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-linen/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
          <Link to="/" className="shrink-0 transition hover:opacity-80">
            <span className="font-display text-[2rem] leading-none tracking-[0.06em]">GREIGE</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.28em] text-ink-soft">
              Source studio
            </span>
          </Link>

          {/* Desktop primary nav */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group relative inline-flex items-center gap-1.5 px-3 py-2 text-sm tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-ink' : 'text-ink-soft hover:text-indigo'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px" />
                      {item.label}
                      {item.to === '/cart' && count > 0 ? ` · ${count}` : ''}
                      {isActive ? (
                        <motion.span
                          layoutId="buyer-nav"
                          className="absolute inset-x-2 -bottom-0.5 h-px bg-indigo"
                        />
                      ) : (
                        <span className="absolute inset-x-2 -bottom-0.5 h-px origin-left scale-x-0 bg-indigo transition-transform duration-200 group-hover:scale-x-100" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => openWarp()}
              title="Ask Warp — AI fabric assistant"
              aria-label="Ask Warp AI assistant"
              className="inline-flex items-center gap-2 border border-indigo/25 bg-indigo/5 px-2.5 py-2 text-sm text-indigo hover:border-indigo hover:bg-indigo/10 md:px-3"
            >
              <WarpIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Ask Warp</span>
              <span className="rounded bg-indigo px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-linen">
                AI
              </span>
            </button>

            {isGuest ? (
              <>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <LoginIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
                <Link
                  to="/register/buyer"
                  className="btn-primary hidden text-sm md:inline-flex"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                <div className="hidden items-center gap-2 border border-line bg-white/30 px-3 py-1.5 sm:flex">
                  <span className="flex h-7 w-7 items-center justify-center bg-indigo text-[11px] font-semibold text-linen">
                    {(user?.name || 'B').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-medium">{user?.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-soft">Buyer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                  aria-label="Log out"
                >
                  <LogoutIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Log out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="buyer-main flex-1 lg:pb-0">
        <Outlet />
      </main>

      <SiteFooter variant="buyer" />

      {/* Phone + tablet primary nav — desktop uses the top header links */}
      {!warpOpen ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-linen/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          aria-label="Primary"
        >
          <div className="grid grid-cols-6 gap-0.5 px-0.5 py-2 text-[9px] sm:gap-1 sm:px-2 sm:text-[10px]">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-1 transition-colors duration-200 ${
                      isActive ? 'text-indigo' : 'text-ink-soft hover:text-indigo'
                    }`
                  }
                >
                  <span className="relative">
                    <Icon className="h-4 w-4" />
                    {item.to === '/cart' && count > 0 ? (
                      <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center bg-indigo px-0.5 text-[9px] font-semibold text-linen">
                        {count > 9 ? '9+' : count}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={() => openWarp()}
              aria-label="Ask Warp AI assistant"
              className="flex flex-col items-center gap-0.5 py-1 text-indigo transition-colors duration-200"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <WarpIcon className="h-4 w-4" />
                <span className="absolute -right-2 -top-1 bg-indigo px-0.5 text-[8px] font-bold uppercase leading-none text-linen">
                  AI
                </span>
              </span>
              <span className="font-medium">Ask AI</span>
            </button>
          </div>
        </nav>
      ) : null}

      <WarpPanel />
    </div>
  );
}
