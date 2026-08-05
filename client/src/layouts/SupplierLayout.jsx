import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SiteFooter from '../components/SiteFooter';
import {
  HomeIcon,
  InventoryIcon,
  LogoutIcon,
  OrdersIcon,
  UserIcon,
} from '../components/Icons';

const links = [
  { to: '/supplier', label: 'Console', end: true, hint: 'Live mill pulse', icon: HomeIcon },
  { to: '/supplier/orders', label: 'Pipeline', hint: 'Order kanban', icon: OrdersIcon },
  { to: '/supplier/inventory', label: 'Inventory', hint: 'Cloth catalog', icon: InventoryIcon },
  { to: '/supplier/profile', label: 'Profile', hint: 'Business details', icon: UserIcon },
];

export default function SupplierLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop mill rail */}
      <aside className="mill-rail hidden text-linen lg:block">
        <div className="flex h-full min-h-screen flex-col px-5 py-6">
          <Link to="/supplier" className="block">
            <p className="font-display text-3xl tracking-[0.05em]">GREIGE</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-linen/55">Mill Console</p>
          </Link>

          <div className="mt-8 border border-linen/15 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-linen/50">Signed in</p>
            <p className="mt-1 text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-linen/55">{user?.email}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-1" aria-label="Mill console">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `border px-3 py-3 transition ${
                      isActive
                        ? 'border-linen/30 bg-linen/10 text-linen'
                        : 'border-transparent text-linen/65 hover:bg-white/5 hover:text-linen'
                    }`
                  }
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {item.label === 'Profile' ? 'Mill profile' : item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-linen/45">{item.hint}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <p className="text-[11px] leading-relaxed text-linen/45">
              From pending to dispatch — keep the loom moving.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-linen/20 px-3 py-2 text-sm text-linen/80 hover:bg-white/5"
            >
              <LogoutIcon className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile / tablet top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-linen/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link to="/supplier" className="min-w-0">
              <p className="font-display text-2xl leading-none tracking-[0.05em]">GREIGE</p>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                {user?.name || 'Mill console'}
              </p>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm"
              aria-label="Log out"
            >
              <LogoutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Desktop content header */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-line bg-linen/85 px-8 py-3 backdrop-blur-md lg:flex">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">Supplier workspace</p>
            <p className="font-display text-2xl leading-none">Operational floor</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <SiteFooter variant="supplier" />
      </div>

      {/* Mobile / tablet bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-linen/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4 gap-1 px-1 py-2 sm:px-2">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors sm:text-[11px] ${
                    isActive ? 'text-indigo' : 'text-ink-soft hover:text-indigo'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
