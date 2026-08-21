import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, ArrowRight, Leaf } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="bg-[#0F0600] text-amber-300/70 border-t border-[#3D1206]">

      {/* Gold Top Divider */}
      <div className="gold-divider"></div>

      {/* Trust Strip */}
      <div className="bg-[#1A0A04] border-b border-[#3D1206]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-5 h-5" />, label: 'Express Delivery', sub: 'Ships within 24hrs' },
            { icon: <ShieldCheck className="w-5 h-5" />, label: '100% Authentic', sub: 'Lab tested quality' },
            { icon: <Leaf className="w-5 h-5" />, label: 'Pure Vegetarian', sub: 'Zero preservatives' },
            { icon: <RotateCcw className="w-5 h-5" />, label: '7-Day Returns', sub: 'Hassle-free refunds' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#7B1A1A]/20 border border-[#E6A817]/20 text-[#E6A817] flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-xs font-bold text-amber-100">{label}</p>
                <p className="text-[10px] text-amber-400/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <img src="/naivadyam-logo.png" alt="Naivadyam" className="h-12 w-auto object-contain" />
            <p className="text-xs leading-relaxed text-amber-400/60">
              Authentic Indian instant premix, traditional sweets and sacred offerings.
              Made with pure ingredients. Served with love. The Divine Serve since 1998.
            </p>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="veg-badge">100% Pure Veg</span>
              <span className="px-2 py-1 border border-[#E6A817]/30 rounded text-[#E6A817]/70">No Preservatives</span>
            </div>
          </div>

          {/* Company & Info */}
          <div>
            <h4 className="text-xs font-black text-amber-100 mb-4 uppercase tracking-widest">About Naivadyam</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                ['About Us', '/about-us'],
                ['All Catalog', '/catalog'],
                ['Instant Premix', '/premix'],
                ['Contact Us', '/contact-us'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="hover:text-[#E6A817] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#E6A817]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-black text-amber-100 mb-4 uppercase tracking-widest">Customer Policies</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                ['Return Policy', '/return-policy'],
                ['Refund Policy', '/refund-policy'],
                ['Privacy Policy', '/privacy-policy'],
                ['Disclaimer', '/disclaimer'],
                ['Track My Order', '/profile?tab=orders'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="hover:text-[#E6A817] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#E6A817]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-amber-100 uppercase tracking-widest">Festive Offers</h4>
            <p className="text-xs text-amber-400/60">Subscribe for exclusive Diwali, Navratri and festive offers.</p>
            {subscribed ? (
              <div className="p-3 bg-[#1D7A40]/20 border border-[#1D7A40]/40 rounded-xl text-xs text-[#4ade80] font-semibold">
                🪔 Subscribed! Watch for festive offers.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 text-xs bg-[#1A0A04] border border-[#3D1206] rounded-xl text-amber-100 focus:outline-none focus:border-[#E6A817]/50 placeholder-amber-700/50"
                  />
                  <button type="submit" className="btn-gold px-3 py-2 text-xs rounded-xl">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
            <div className="flex items-center gap-2 text-[10px] text-amber-400/40">
              <Mail className="w-3 h-3" /> naivyadyamtds@gmail.com
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#3D1206] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-amber-400/40">
            © 2025 Naivadyam — The Divine Serve. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-amber-400/40">
            <span>🔒 Secure Payments</span>
            <span>🪔 Pure Vegetarian</span>
            <span>🍃 Natural Ingredients</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
