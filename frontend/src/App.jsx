import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/common/AuthModal';
import NotificationToast from './components/common/NotificationToast';
import CustomerSupportWidget from './components/common/CustomerSupportWidget';

import HomePage from './pages/customer/HomePage';
import CatalogPage from './pages/customer/CatalogPage';
import PremixPage from './pages/customer/PremixPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import UserProfilePage from './pages/customer/UserProfilePage';

import ReturnPolicyPage from './pages/customer/ReturnPolicyPage';
import RefundPolicyPage from './pages/customer/RefundPolicyPage';
import PrivacyPolicyPage from './pages/customer/PrivacyPolicyPage';
import DisclaimerPage from './pages/customer/DisclaimerPage';
import AboutUsPage from './pages/customer/AboutUsPage';
import ContactUsPage from './pages/customer/ContactUsPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0F0600] via-[#3D1206] to-[#1A0800]">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E6A817 0px, #E6A817 1px, transparent 1px, transparent 24px)' }}
      ></div>
      <img
        src="/naivadyam-logo.png"
        alt="Naivadyam"
        className="h-32 w-auto object-contain drop-shadow-2xl animate-pulse"
        style={{ filter: 'brightness(1.1) drop-shadow(0 0 24px rgba(230,168,23,0.4))' }}
      />
      <p className="mt-5 text-[#E6A817]/70 text-xs font-bold tracking-widest uppercase">The Divine Serve · नैवेद्यम्</p>
      <div className="mt-5 flex gap-1.5">
        <div className="w-2 h-2 bg-[#E6A817] rounded-full animate-bounce [animation-delay:0ms]"></div>
        <div className="w-2 h-2 bg-[#F5C518] rounded-full animate-bounce [animation-delay:150ms]"></div>
        <div className="w-2 h-2 bg-[#E6A817] rounded-full animate-bounce [animation-delay:300ms]"></div>
      </div>
    </div>
  );
}

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors" style={{ background: 'var(--bg-base)' }}>
      <Routes>
        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
        </Route>

        {/* Customer Storefront Routes */}
        <Route
          path="*"
          element={
            <>
              <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/products" element={<CatalogPage />} />
                  <Route path="/premix" element={<PremixPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage onOpenAuthModal={() => setAuthModalOpen(true)} />} />
                  <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  
                  {/* Legal & Information Routes */}
                  <Route path="/return-policy" element={<ReturnPolicyPage />} />
                  <Route path="/returns" element={<ReturnPolicyPage />} />
                  <Route path="/refund-policy" element={<RefundPolicyPage />} />
                  <Route path="/refunds" element={<RefundPolicyPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                </Routes>
              </main>
              <Footer />
              <CustomerSupportWidget />
              <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            </>
          }
        />
      </Routes>
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
