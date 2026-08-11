import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/customer/ProductCard';
import { ChevronDown, Leaf } from 'lucide-react';
import api from '../../services/api';

const PREMIX_TYPES = [
  { label: 'All Premix', value: '' },
  { label: '🥘 South Indian', value: 'South Indian Premix' },
  { label: '🫓 Maharashtrian', value: 'Maharashtrian Premix' },
  { label: '🟡 Gujarati', value: 'Gujarati Premix' },
];

const PremixPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategory, setSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category: 'Instant Premix', pageSize: 20, sortBy });
        if (subcategory) params.set('subcategory', subcategory);
        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [subcategory, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Hero Banner */}
      <div className="relative overflow-hidden py-12 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #1A0A00 0%, #3D1206 40%, #5A1A0A 70%, #2A0D04 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E6A817 0px, #E6A817 1px, transparent 1px, transparent 20px)' }}>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E6A817]/30 bg-[#E6A817]/10 text-[#E6A817] text-xs font-black uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5 text-[#1D7A40]" /> 100% Pure Vegetarian · No Preservatives
          </div>
          <h1 className="text-4xl font-black text-white">Instant Premix</h1>
          <p className="text-amber-200/70 text-sm max-w-xl mx-auto leading-relaxed">
            Traditional Indian recipes, ready in minutes. Stone-ground ingredients, no artificial additives.
            <strong className="text-amber-300"> Just add water, cook & serve!</strong>
          </p>

          {/* Subcategory Pills */}
          <div className="flex justify-center flex-wrap gap-2 pt-2">
            {PREMIX_TYPES.map(({ label, value }) => (
              <button key={value} onClick={() => setSubcategory(value)}
                className={`px-5 py-2 text-xs font-bold rounded-full border transition-all ${
                  subcategory === value
                    ? 'bg-[#E6A817] text-[#3D1206] border-[#E6A817] shadow-lg'
                    : 'border-[#E6A817]/30 text-amber-200 hover:border-[#E6A817]/70 hover:bg-[#E6A817]/10'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="gold-divider"></div>



      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">
              {subcategory || 'All Instant Premix'}
            </h2>
            <p className="text-xs text-amber-700 dark:text-amber-400">{products.length} products</p>
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-amber-600 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-product overflow-hidden animate-pulse">
                <div className="aspect-square bg-amber-100 dark:bg-[#231508]"></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-amber-100 dark:bg-[#231508] rounded w-1/3"></div>
                  <div className="h-4 bg-amber-100 dark:bg-[#231508] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🥘</div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">No premix found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremixPage;
