import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import { ArrowRight, ChevronRight, Flame, ShieldCheck, Truck, RotateCcw, Leaf } from 'lucide-react';
import api from '../../services/api';

// Real Naivadyam product images from uploaded packaging
const FEATURED_PRODUCTS_STATIC = [
  { id: 'f1', title: 'Instant Chakli Bhajni', subtitle: 'Traditional Maharashtrian Recipe', img: '/product-chakli.jpg', price: 89, badge: 'BESTSELLER' },
  { id: 'f2', title: 'Dhokla Premix', subtitle: 'Authentic Gujarati Flavour', img: '/product-dhokla.jpg', price: 79, badge: 'POPULAR' },
  { id: 'f3', title: 'Idli Premix', subtitle: 'South Indian Food · Served on Banana Leaf', img: '/product-idli.jpg', price: 99, badge: 'HEALTHY' },
  { id: 'f4', title: 'Medu Wada Premix', subtitle: 'Crispy · Authentic South Indian', img: '/product-meduwada.jpg', price: 89, badge: 'NEW' },
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealOfDayProducts, setDealOfDayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, dealRes, catRes] = await Promise.all([
          api.get('/products?isFeatured=true&pageSize=4'),
          api.get('/products?isDealOfDay=true&pageSize=4'),
          api.get('/products/categories/all')
        ]);
        setFeaturedProducts(featRes.data.products || []);
        setDealOfDayProducts(dealRes.data.products || []);
        setCategories(catRes.data || []);
      } catch (err) { /* silent */ }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-0 pb-16">

      {/* ── Hero Banner ──────────────────────────────────── */}
      <section className="hero-indian relative min-h-[460px] sm:min-h-[520px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Text Side */}
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#E6A817]/30 bg-[#E6A817]/10 text-[#E6A817] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#1D7A40]"></span>
                100% Pure Vegetarian · The Divine Serve
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-none tracking-tight">
                <span className="text-white">Authentic </span>
                <span className="text-gold-gradient">Indian</span>
                <br />
                <span className="text-white">Instant </span>
                <span className="text-brand-gradient">Premix</span>
              </h1>

              <p className="text-amber-200/80 text-xs sm:text-base max-w-md leading-relaxed">
                Traditional recipes crafted by master chefs — Chakli Bhajni, Dhokla, Idli, Medu Wada and more. 
                Ready in minutes. <strong className="text-amber-300">Taste like home.</strong>
              </p>

              <div className="flex flex-row gap-3">
                <Link to="/catalog"
                  className="btn-gold px-5 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2">
                  Explore Catalog <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
                <Link to="/premix"
                  className="btn-outline-gold px-4 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5">
                  🥘 Instant Premix
                </Link>
              </div>

              {/* Trust Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['No Preservatives', 'A2 Cow Ghee', 'Stone Ground', 'Since 1998'].map((label) => (
                  <span key={label} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-200/70 text-[10px] sm:text-xs font-medium">
                    ✓ {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Product Showcase Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {FEATURED_PRODUCTS_STATIC.map((p, i) => (
                <div key={p.id}
                  onClick={() => navigate('/products')}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-[#E6A817]/40 transition-all hover:scale-[1.03] shadow-lg ${i === 0 ? 'animate-float' : ''}`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <img src={p.img} alt={p.title}
                    className="w-full h-32 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="inline-block px-1.5 py-0.5 bg-[#E6A817] text-[#3D1206] text-[9px] sm:text-[10px] font-black rounded mb-0.5">
                      {p.badge}
                    </span>
                    <p className="text-white text-xs font-bold leading-tight truncate">{p.title}</p>
                    <p className="text-amber-300 text-[10px] font-semibold">₹{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider"></div>

      {/* ── Brand Values Strip ───────────────────────────── */}
      <section className="bg-[#7B1A1A] dark:bg-[#5A0E0E] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs font-semibold">
          {[
            { icon: <Truck className="w-5 h-5" />, label: 'Express Delivery', sub: 'Ships within 24hrs' },
            { icon: <ShieldCheck className="w-5 h-5" />, label: '100% Authentic', sub: 'Lab tested quality' },
            { icon: <Leaf className="w-5 h-5" />, label: 'Pure Vegetarian', sub: 'No preservatives' },
            { icon: <RotateCcw className="w-5 h-5" />, label: '7-Day Returns', sub: 'Hassle-free refunds' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#E6A817]/20 border border-[#E6A817]/40 flex items-center justify-center text-[#E6A817]">
                {icon}
              </div>
              <div>
                <p className="font-bold text-white">{label}</p>
                <p className="text-amber-200/70 text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="gold-divider"></div>

      {/* ── Flash Deals Section ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7B1A1A] text-[#E6A817] rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-950 dark:text-amber-50">Flash Deals Today</h2>
              <p className="text-xs text-amber-700 dark:text-amber-400">Limited-time offers on instant premix range</p>
            </div>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-[#7B1A1A] dark:text-[#E6A817] hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealOfDayProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* ── Our Products Showcase (real images) ─────────── */}
      <section className="bg-amber-50/60 dark:bg-[#1A0E08] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-amber-950 dark:text-amber-50">Our Signature Range</h2>
            <p className="text-xs text-amber-700 dark:text-amber-400 max-w-xl mx-auto">
              Traditional recipes, stone-ground ingredients, zero artificial additives — crafted with love by Naivadyam.
            </p>
            <div className="gold-divider max-w-xs mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_PRODUCTS_STATIC.map((p) => (
              <div key={p.id}
                onClick={() => navigate('/products')}
                className="card-product group cursor-pointer flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={p.img} alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="veg-badge mb-2">100% Pure Veg</div>
                    <h3 className="text-sm font-bold text-amber-950 dark:text-amber-50 group-hover:text-[#7B1A1A] dark:group-hover:text-[#E6A817] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">{p.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#7B1A1A] dark:text-[#E6A817]">₹{p.price}</span>
                    <button className="btn-gold text-[11px] px-3 py-1.5 rounded-lg">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link to="/catalog" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm">
              Explore Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
