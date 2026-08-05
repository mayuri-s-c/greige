import { Navigate, Route, Routes } from 'react-router-dom';
import { BuyerPublicRoute, ProtectedRoute, PublicOnly } from './components/ProtectedRoute';
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterBuyerPage from './pages/RegisterBuyerPage';
import RegisterSupplierPage from './pages/RegisterSupplierPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import BuyerOnboardingPage from './pages/BuyerOnboardingPage';
import BoardsPage from './pages/BoardsPage';
import SupplierDashboardPage from './pages/supplier/SupplierDashboardPage';
import InventoryPage from './pages/supplier/InventoryPage';
import SupplierOrdersPage from './pages/supplier/SupplierOrdersPage';
import SupplierProfilePage from './pages/supplier/SupplierProfilePage';
import SupplierOnboardingPage from './pages/supplier/SupplierOnboardingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/buyer" element={<RegisterBuyerPage />} />
        <Route path="/register/supplier" element={<RegisterSupplierPage />} />
      </Route>

      {/* Browse, studio overview, Warp — no login required */}
      <Route element={<BuyerPublicRoute />}>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<MarketplacePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/dashboard" element={<BuyerDashboardPage />} />
        </Route>
      </Route>

      {/* Account actions — login required */}
      <Route element={<ProtectedRoute role="buyer" />}>
        <Route path="/onboarding" element={<BuyerOnboardingPage />} />
        <Route element={<BuyerLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/boards" element={<BoardsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="supplier" />}>
        <Route path="/supplier/onboarding" element={<SupplierOnboardingPage />} />
        <Route element={<SupplierLayout />}>
          <Route path="/supplier" element={<SupplierDashboardPage />} />
          <Route path="/supplier/inventory" element={<InventoryPage />} />
          <Route path="/supplier/orders" element={<SupplierOrdersPage />} />
          <Route path="/supplier/profile" element={<SupplierProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
