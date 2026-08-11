import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Search, ShoppingBag, Heart, User, Sun, Moon, Menu, X, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import api from '../../services/api';

import { getInitials } from '../../utils/getInitials';

const Navbar = ({ onOpenAuthModal }) => {
  const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
  const { itemCount, wishlist } = useContext(CartContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const { data } = await api.get(`/products?keyword=${searchTerm}&pageSize=5`);
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        } catch (err) { /* silent */ }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 glass-surface ${scrolled ? 'shadow-xl shadow-[#7B1A1A]/10' : ''}`}>

      {/* Brand Announcement Stripe */}
      <div className="brand-stripe text-amber-200 text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="text-yellow-300 text-base">🪔</span>
        <span>
          <strong>नैवेद्यम् — The Divine Serve</strong> &nbsp;|&nbsp;
          100% Pure Vegetarian &nbsp;·&nbsp; Authentic Indian Recipes &nbsp;·&nbsp;
          Extra 10% OFF with code <strong className="text-yellow-300 underline decoration-dotted">NAIVADYAM10</strong>
        </span>
        <span className="text-yellow-300 text-base">🪔</span>
      </div>

      {/* Gold Divider */}
      <div className="gold-divider"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/naivadyam-logo.png"
              alt="Naivadyam — The Divine Serve"
              className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search chakli, idli premix, dhokla, spices..."
                className="w-full pl-10 pr-10 py-2.5 rounded-full text-sm border transition-all focus:outline-none focus:ring-2
                           bg-amber-50/60 dark:bg-[#231508]/80
                           border-amber-200 dark:border-[#3D2010]
                           text-amber-950 dark:text-amber-100
                           placeholder-amber-700/50 dark:placeholder-amber-500/50
                           focus:ring-[#E6A817]/50 focus:border-[#E6A817]"
              />
              <Search className="w-4 h-4 text-[#7B1A1A] dark:text-amber-400 absolute left-3.5 top-3.5" />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3.5 top-3 text-amber-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1A0E08] rounded-2xl shadow-2xl border border-amber-100 dark:border-[#3D2010] overflow-hidden z-50 animate-fade-in">
                <p className="text-[10px] font-bold text-[#7B1A1A] dark:text-amber-400 uppercase tracking-widest px-4 pt-3 pb-1">Suggestions</p>
                {suggestions.map((item) => (
                  <div key={item._id}
                    onClick={() => { setShowSuggestions(false); setSearchTerm(''); navigate(`/product/${item.slug}`); }}
                    className="flex items-center gap-3 p-3 hover:bg-amber-50 dark:hover:bg-[#231508] cursor-pointer border-b border-amber-50 dark:border-[#231508] last:border-0 transition-colors"
                  >
                    <img src={item.images[0]} alt={item.title} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-950 dark:text-amber-50 truncate">{item.title}</p>
                      <p className="text-xs text-[#E6A817] font-bold">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold">
            {[
              ['Catalog', '/catalog'],
              ['Instant Premix', '/premix'],
            ].map(([label, path]) => (
              <Link key={path} to={path}
                className="text-[#5A2D0C] dark:text-amber-200 hover:text-[#7B1A1A] dark:hover:text-[#E6A817] transition-colors relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#E6A817] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2">

            <Link to="/profile?tab=wishlist"
              className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-[#231508] text-[#7B1A1A] dark:text-amber-300 relative transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart"
              className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-[#231508] text-[#7B1A1A] dark:text-amber-300 relative transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#E6A817] text-[#3D1206] text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-[#231508] transition-colors border border-amber-200 dark:border-[#3D2010]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B1A1A] to-[#E6A817] text-[#F5C518] flex items-center justify-center font-black text-xs ring-2 ring-[#E6A817]/40 shadow flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-xs font-bold hidden md:inline text-amber-950 dark:text-amber-100 max-w-[90px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700 hidden md:inline" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1A0E08] rounded-2xl shadow-2xl border border-amber-100 dark:border-[#3D2010] py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-amber-50 dark:border-[#2A1A0C]">
                      <p className="text-sm font-bold text-amber-950 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#7B1A1A]/10 text-[#7B1A1A] dark:text-amber-300 text-[10px] font-bold rounded-md border border-[#7B1A1A]/20">
                          Admin
                        </span>
                      )}
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#E6A817] hover:bg-amber-50 dark:hover:bg-[#231508]">
                        <ShieldAlert className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-[#231508]">
                      <User className="w-4 h-4 text-[#7B1A1A]" /> My Account & Orders
                    </Link>
                    <button onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onOpenAuthModal}
                className="btn-primary px-5 py-2.5 text-xs rounded-full flex items-center gap-1.5">
                <User className="w-4 h-4" /> Sign In
              </button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-[#231508] text-[#7B1A1A] dark:text-amber-300">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#1A0E08] border-t border-amber-100 dark:border-[#3D2010] p-4 space-y-4 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-amber-50 dark:bg-[#231508] border border-amber-200 dark:border-[#3D2010] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6A817]/50"
            />
            <Search className="w-4 h-4 text-[#7B1A1A] absolute left-3 top-3.5" />
          </form>
          <div className="flex flex-col gap-0.5 text-sm font-bold text-amber-900 dark:text-amber-200">
            {[
              ['Catalog', '/catalog'],
              ['Instant Premix', '/premix'],
            ].map(([label, path]) => (
              <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 border-b border-amber-50 dark:border-[#2A1A0C] last:border-0 hover:text-[#7B1A1A]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
