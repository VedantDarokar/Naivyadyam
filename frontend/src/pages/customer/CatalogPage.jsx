import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, Star, Grid3X3, List } from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  { label: 'All Products', value: '' },
  { label: '🥘 Instant Premix', value: 'Instant Premix' },
];

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ pageSize: 12, page, sortBy });
        if (search) params.set('keyword', search);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [search, category, sortBy, minPrice, maxPrice, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); };
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Page Hero */}
      <div className="relative bg-gradient-to-r from-[#5A0E0E] via-[#7B1A1A] to-[#3D1206] py-10 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E6A817 0px, #E6A817 1px, transparent 1px, transparent 16px)' }}>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <p className="text-[#E6A817] text-xs font-black uppercase tracking-widest">🪔 The Divine Serve</p>
          <h1 className="text-3xl font-black text-white">Our Complete Catalog</h1>
          <p className="text-amber-200/70 text-sm">Authentic Indian instant premix range — 100% Pure Vegetarian</p>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search chakli, idli, ladoo, masala..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full bg-white/95 text-amber-950 placeholder-amber-700/60 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/50 border border-[#E6A817]/30"
              />
            </div>
            {search && <button type="button" onClick={() => setSearch('')} className="p-2.5 bg-white/20 text-white rounded-full"><X className="w-4 h-4" /></button>}
          </form>
        </div>
      </div>
      <div className="gold-divider"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Category Quick Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(({ label, value }) => (
            <button key={value} onClick={() => { setCategory(value); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                category === value
                  ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A] shadow-md'
                  : 'bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/60'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {loading ? 'Loading...' : <><strong className="text-amber-950 dark:text-amber-50">{total}</strong> products found</>}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${filtersOpen ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200'}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-amber-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="mb-6 p-5 rounded-2xl border border-amber-200 dark:border-[#3D2010] bg-amber-50/80 dark:bg-[#1A0E08] animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-2">Min Price (₹)</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#231508] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30" />
              </div>
              <div>
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-2">Max Price (₹)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999"
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#231508] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30" />
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSearch(''); setCategory(''); setPage(1); }}
                  className="px-4 py-2 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors">
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-product overflow-hidden animate-pulse">
                <div className="aspect-square bg-amber-100 dark:bg-[#231508]"></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-amber-100 dark:bg-[#231508] rounded w-1/3"></div>
                  <div className="h-4 bg-amber-100 dark:bg-[#231508] rounded"></div>
                  <div className="h-3 bg-amber-100 dark:bg-[#231508] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-lg font-black text-amber-950 dark:text-amber-50">No products found</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">Try different keywords or remove filters</p>
            <button onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); }}
              className="btn-primary px-6 py-2.5 text-sm rounded-full">Clear & Browse All</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-200 dark:border-[#3D2010] disabled:opacity-40 hover:border-[#E6A817]/50 text-amber-900 dark:text-amber-200">
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${page === i + 1 ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-200 dark:border-[#3D2010] disabled:opacity-40 hover:border-[#E6A817]/50 text-amber-900 dark:text-amber-200">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
