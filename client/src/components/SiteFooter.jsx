import { Link } from 'react-router-dom';

const buyerLinks = [
  { to: '/', label: 'Greige Floor' },
  { to: '/boards', label: 'Boards' },
  { to: '/cart', label: 'Cart' },
  { to: '/dashboard', label: 'Studio' },
];

const supplierLinks = [
  { to: '/supplier', label: 'Console' },
  { to: '/supplier/orders', label: 'Pipeline' },
  { to: '/supplier/inventory', label: 'Inventory' },
  { to: '/supplier/profile', label: 'Mill profile' },
];

export default function SiteFooter({ variant = 'buyer' }) {
  const links = variant === 'supplier' ? supplierLinks : buyerLinks;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-ink text-linen">
      <div
        className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-8 pb-[max(2.5rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] md:flex-row md:items-end md:justify-between md:gap-8 md:px-6 md:pt-10 lg:pb-12 lg:pt-12"
      >
        <div className="max-w-md">
          <p className="font-display text-3xl tracking-[0.06em] md:text-4xl">GREIGE</p>
          <p className="mt-2 text-sm leading-relaxed text-linen/65">
            From the loom, before the finish. Mill-true sourcing for buyers and suppliers.
          </p>
        </div>

        {/* Footer links only on desktop — phone/tablet already have bottom tabs */}
        <div className="hidden flex-col gap-4 lg:flex lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative text-linen/65 transition-colors duration-200 hover:text-linen"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-linen transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <p className="text-[11px] uppercase tracking-[0.18em] text-linen/45">
            © {year} GREIGE · Marketplace prototype
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-[0.18em] text-linen/45 lg:hidden">
          © {year} GREIGE · Marketplace prototype
        </p>
      </div>
    </footer>
  );
}
