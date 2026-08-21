import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Link, useSearchParams } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Heart, Ticket, Lock, Leaf } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import api from '../../services/api';

import { getInitials } from '../../utils/getInitials';

const UserProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { wishlist, setWishlist } = useContext(CartContext);
  const [searchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'orders') {
      setLoading(true);
      api.get('/orders/my').then(({ data }) => {
        const orderList = Array.isArray(data) ? data : (data.orders || []);
        setOrders(orderList);
      }).catch(() => {}).finally(() => setLoading(false));
    }
    if (activeTab === 'tickets') {
      setLoading(true);
      api.get('/tickets/my').then(({ data }) => {
        const ticketList = Array.isArray(data) ? data : (data.tickets || []);
        setTickets(ticketList);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      setLoading(true);
      api.get('/products?pageSize=50')
        .then(({ data }) => {
          const all = data.products || [];
          const wishlistStrIds = wishlist.map(w => typeof w === 'object' ? (w._id || w.id || w).toString() : String(w));
          const matched = all.filter(p => {
            const pId = (p._id || p.id || '').toString();
            return wishlistStrIds.includes(pId) || wishlistStrIds.includes(p.slug);
          });
          setWishlistProducts(matched);

          // Clean up stale IDs that don't match any existing database product
          const validIds = matched.map(p => (p._id || p.id || '').toString());
          const cleanedWishlist = wishlistStrIds.filter(id => validIds.includes(id));
          if (cleanedWishlist.length !== wishlist.length) {
            setWishlist(cleanedWishlist);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeTab, wishlist]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">Sign in to view your profile</h2>
        <p className="text-sm text-amber-700 dark:text-amber-400">Access your orders, wishlist and more</p>
      </div>
    </div>
  );

  const TABS = [
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'tickets', label: 'Support', icon: <Ticket className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
  ];

  const STATUS_STYLE = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-[#1D7A40]/10 text-[#1D7A40] border-[#1D7A40]/30',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#5A0E0E] to-[#7B1A1A] rounded-2xl p-6 mb-8 flex items-center gap-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E6A817 0px, #E6A817 1px, transparent 1px, transparent 12px)' }}></div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E6A817] via-[#F5C518] to-[#7B1A1A] text-[#3D1206] font-black text-xl flex items-center justify-center ring-4 ring-[#E6A817]/40 shadow-xl relative z-10 flex-shrink-0">
          {getInitials(user.name)}
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white">{user.name}</h1>
          <p className="text-amber-300/80 text-xs">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="veg-badge">Naivadyam Member</span>
            {user.role === 'admin' && (
              <Link to="/admin" className="px-2 py-0.5 bg-[#E6A817] text-[#3D1206] text-[10px] font-black rounded">Admin Panel</Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Tabs */}
        <div className="flex flex-row overflow-x-auto lg:flex-col lg:space-y-1 gap-2 lg:gap-0 pb-2 lg:pb-0 scrollbar-none">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-4 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold text-left transition-all ${
                activeTab === tab.id ? 'bg-[#7B1A1A] text-[#F5C518] shadow-md' : 'bg-amber-50 dark:bg-[#1A0E08] lg:bg-transparent text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-[#231508]'
              }`}>
              <span className={activeTab === tab.id ? 'text-[#E6A817]' : 'text-amber-600 dark:text-amber-400'}>{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
          <button onClick={logout} className="flex-shrink-0 lg:w-full flex items-center gap-2.5 px-4 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 lg:bg-transparent hover:bg-rose-100 dark:hover:bg-rose-950/40 text-left lg:mt-2">
            <span className="whitespace-nowrap">Sign Out</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-amber-950 dark:text-amber-50">My Orders</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-amber-50 dark:bg-[#1A0E08] animate-pulse"></div>)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-amber-300 mx-auto" />
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">No orders yet</p>
                  <Link to="/catalog" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs">Start Shopping</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="card-product p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-black text-amber-950 dark:text-amber-50">Order #{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border capitalize ${STATUS_STYLE[(order.orderStatus || order.status || 'placed').toLowerCase()] || 'bg-amber-50 text-amber-700'}`}>
                        {order.orderStatus || order.status || 'Placed'}
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(order.orderItems || order.items || []).slice(0, 4).map((item, i) => (
                        <img key={i} src={item.image || item.images?.[0] || item.product?.images?.[0] || item.product?.image} alt={item.title || ''} className="w-12 h-12 rounded-lg object-contain bg-amber-50 dark:bg-[#1A0E08] border border-amber-100 dark:border-[#3D2010] flex-shrink-0" />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#7B1A1A] dark:text-[#E6A817]">₹{(order.totalAmount || order.priceBreakup?.total || 0).toLocaleString()}</span>
                      <Link to={`/order-tracking/${order._id}`} className="btn-gold text-[11px] px-4 py-1.5 rounded-lg">Track Order</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-amber-950 dark:text-amber-50">My Wishlist</h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-amber-50 dark:bg-[#1A0E08] animate-pulse"></div>)}
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="text-5xl">❤️</div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Your wishlist is empty</p>
                  <Link to="/catalog" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-amber-950 dark:text-amber-50">My Account</h2>
              <div className="card-product p-5 space-y-4">
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Phone', value: user.phone || '—' },
                  { label: 'Role', value: user.role },
                  { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-amber-100 dark:border-[#2A1A0C] pb-3 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{label}</span>
                    <span className="text-xs font-semibold text-amber-950 dark:text-amber-50 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-amber-950 dark:text-amber-50">Support Tickets & Inquiries</h2>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Track support desk status & official staff responses</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-amber-50 dark:bg-[#1A0E08] animate-pulse"></div>)}</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16 space-y-3 border border-dashed border-amber-200 dark:border-[#3D2010] rounded-2xl">
                  <Ticket className="w-12 h-12 text-amber-300 mx-auto" />
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">No support tickets found</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Click the floating headphones icon at the bottom right to raise a support ticket.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t) => {
                    const ticketIdStr = t._id ? t._id.toString().slice(-6).toUpperCase() : 'TK';
                    const formattedDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                    return (
                      <div key={t._id} className="card-product p-5 space-y-3 border border-amber-200/80 dark:border-[#3D2010]">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 dark:border-[#2A1A0C] pb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">#{ticketIdStr}</span>
                              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-50">{t.subject}</h3>
                            </div>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">Submitted on {formattedDate} {t.orderId ? `· Order: #${t.orderId}` : ''}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase border ${
                              t.priority === 'Urgent' || t.priority === 'High'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            }`}>
                              {t.priority || 'Medium'} Priority
                            </span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase border ${
                              t.status === 'Resolved' || t.status === 'resolved'
                                ? 'bg-[#1D7A40]/10 text-[#1D7A40] border-[#1D7A40]/30'
                                : t.status === 'In Progress'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            }`}>
                              {t.status || 'Open'}
                            </span>
                          </div>
                        </div>

                        {/* Customer Message */}
                        <div className="text-xs text-amber-900/90 dark:text-amber-200/90 bg-amber-50/50 dark:bg-[#1A0E08] p-3 rounded-xl border border-amber-100 dark:border-[#231208]">
                          <p className="font-bold text-[10px] text-amber-700 dark:text-amber-400 mb-1">Your Issue Description:</p>
                          <p className="whitespace-pre-wrap">{t.message || t.description}</p>
                        </div>

                        {/* Official Support Response */}
                        {t.response ? (
                          <div className="p-4 bg-[#1D7A40]/5 border border-[#1D7A40]/30 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D7A40]">
                              <Leaf className="w-4 h-4" /> Official Response from Naivadyam Care
                            </div>
                            <p className="text-xs text-amber-950 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
                              {t.response}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-50/30 dark:bg-[#150A04] rounded-lg text-[10px] text-amber-600 dark:text-amber-400 italic">
                            ⏳ Support desk has received your ticket. Expected response within 4 hours.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Addresses tab */}
          {activeTab === 'addresses' && (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">📦</div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">No saved addresses</p>
              <Link to="/catalog" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
