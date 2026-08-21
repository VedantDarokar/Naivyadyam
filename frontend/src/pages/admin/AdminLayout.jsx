import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, Ticket, LogOut, ShieldAlert, ArrowLeft, Menu, X
} from 'lucide-react';
import { getInitials } from '../../utils/getInitials';
import api from '../../services/api';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders', key: 'orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/tickets', icon: Ticket, label: 'Support', key: 'tickets' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchCounts = async () => {
      try {
        const [ticketsRes, ordersRes] = await Promise.all([
          api.get('/admin/tickets'),
          api.get('/admin/orders')
        ]);

        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        // Count open/unhandled tickets
        const openTk = tickets.filter(t => (t.status === 'Open' || t.status === 'In Progress') && !t.deletedByAdmin).length;
        setOpenTicketsCount(openTk);

        // Count new/placed orders
        const newOrd = orders.filter(o => o.orderStatus === 'Placed' || o.orderStatus === 'Confirmed').length;
        setPendingOrdersCount(newOrd);
      } catch (err) {
        // silent fetch
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [user]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0600] p-4">
        <div className="text-center space-y-4 p-8 bg-[#1A0A04] border border-[#3D1206] rounded-3xl max-w-md shadow-2xl">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto animate-pulse" />
          <h2 className="text-xl font-black text-white">Admin Access Restricted</h2>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Unauthorized access prohibited. You must be signed in with an authorized Administrator account to access the Admin Control Panel.
          </p>
          <div className="pt-2">
            <Link to="/" className="w-full py-3 bg-[#E6A817] hover:bg-[#F5C518] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors inline-block text-center shadow-lg">
              Return to Customer Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0F0600] overflow-hidden">

      {/* Mobile Header Bar */}
      <header className="md:hidden bg-[#1A0A04] border-b border-[#3D1206] px-4 py-3 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/naivadyam-logo.png" alt="Naivadyam" className="h-8 w-auto object-contain" />
          <span className="text-[10px] font-black text-[#E6A817]/80 uppercase tracking-widest">Admin Desk</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#231508] text-amber-400 border border-[#3D1206] hover:bg-[#3D1206] transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Slide Drawer) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1A0A04] border-r border-[#3D1206] p-5 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo + Label */}
          <div className="space-y-1.5 flex items-center justify-between md:block">
            <div>
              <img src="/naivadyam-logo.png" alt="Naivadyam" className="h-10 w-auto object-contain" />
              <div className="gold-divider mt-2"></div>
              <span className="text-[9px] font-black text-[#E6A817]/70 uppercase tracking-widest block mt-1">Admin Control Panel</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              let badgeCount = 0;
              if (item.key === 'tickets') badgeCount = openTicketsCount;
              if (item.key === 'orders') badgeCount = pendingOrdersCount;

              return (
                <NavLink key={item.path} to={item.path}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#7B1A1A] text-[#F5C518]'
                      : 'text-amber-400/70 hover:bg-[#231508] hover:text-amber-200'
                  }`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E6A817]' : ''}`} />
                    <span>{item.label}</span>
                  </div>

                  {badgeCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-600 rounded-full ring-2 ring-[#1A0A04] animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4">
          <Link to="/" className="flex items-center gap-2 text-xs text-amber-400/60 hover:text-amber-200 px-3 py-2 rounded-xl hover:bg-[#231508] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Customer Store
          </Link>
          <div className="border-t border-[#3D1206] pt-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B1A1A] to-[#E6A817] text-[#F5C518] flex items-center justify-center font-black text-xs ring-2 ring-[#E6A817]/30 flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-amber-100 truncate">{user.name}</p>
                <p className="text-[9px] text-amber-400/60 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0F0600]">
        <div className="p-4 sm:p-6 md:p-8 min-h-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
