import React, { useContext } from 'react';
import { NavLink, useLocation, Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, Ticket, LogOut, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { getInitials } from '../../utils/getInitials';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/tickets', icon: Ticket, label: 'Support' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0600]">
        <div className="text-center space-y-4 p-8 card-product max-w-sm">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">Admin Sign In Required</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">Please sign in to access the Admin Control Panel.</p>
          <Link to="/" className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm">Return to Customer Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F0600] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 bg-[#1A0A04] border-r border-[#3D1206] p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Logo + Label */}
          <div className="space-y-1.5">
            <img src="/naivadyam-logo.png" alt="Naivadyam" className="h-10 w-auto object-contain" />
            <div className="gold-divider"></div>
            <span className="text-[9px] font-black text-[#E6A817]/70 uppercase tracking-widest block">Admin Control Panel</span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#7B1A1A] text-[#F5C518]'
                      : 'text-amber-400/70 hover:bg-[#231508] hover:text-amber-200'
                  }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E6A817]' : ''}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2">
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0F0600]">
        <div className="p-6 min-h-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
