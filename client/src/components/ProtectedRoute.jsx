import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthBootstrap({ children }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapping = useAuthStore((s) => s.bootstrapping);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    bootstrap();
  }, [hydrated, bootstrap]);

  if (!hydrated || bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen text-ink-soft">
        <p className="text-sm tracking-wide">Checking secure session…</p>
      </div>
    );
  }

  return children;
}

/** Greige Floor, Cloth Passport, Studio preview, Warp — open to guests. */
export function BuyerPublicRoute() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'supplier') {
    return <Navigate to="/supplier" replace />;
  }
  return <Outlet />;
}

export function ProtectedRoute({ role }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'supplier' ? '/supplier' : '/'} replace />;
  }

  if (!user.onboardingComplete && !location.pathname.includes('/onboarding')) {
    return (
      <Navigate
        to={user.role === 'supplier' ? '/supplier/onboarding' : '/onboarding'}
        replace
      />
    );
  }

  return <Outlet />;
}

export function PublicOnly() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (token && user) {
    return <Navigate to={user.role === 'supplier' ? '/supplier' : '/'} replace />;
  }
  return <Outlet />;
}
