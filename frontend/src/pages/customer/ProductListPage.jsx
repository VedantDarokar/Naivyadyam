import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, Star, Leaf } from 'lucide-react';
import api from '../../services/api';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const CATEGORIES = ['Instant Premix', 'Traditional Sweets', 'Savory Snacks', 'Spices & Masala'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (category) params.set('category', category);
        if (sortBy) params.set('sortBy', sortBy);
        if (page > 1) params.set('page', page);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (minRating) params.set('minRating', minRating);
        params.set('pageSize', 12);

        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
          <Link to="/" className="hover:text-[#7B1A1A] dark:hover:text-[#E6A817]">Home</Link>
          <span>/</span>
          <span className="text-amber-950 dark:text-amber-100 font-semibold">{category || 'All Products'}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">
              {category || 'All Products'}
            </h1>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {loading ? 'Loading...' : `${total} authentic Naivadyam products`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setParam('sortBy', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border
                  bg-white dark:bg-[#1A0E08]
                  border-amber-200 dark:border-[#3D2010]
                  text-amber-950 dark:text-amber-100
                  focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-amber-600 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                filtersOpen ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="mb-6 p-5 bg-amber-50 dark:bg-[#1A0E08] rounded-2xl border border-amber-200 dark:border-[#3D2010] animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category */}
            <div>
              <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mb-2">Category</label>
              <div className="space-y-1.5">
                <button onClick={() => setParam('category', '')}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${!category ? 'bg-[#7B1A1A] text-[#F5C518] font-bold' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-[#231508]'}`}>
                  All Products
                </button>
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setParam('category', c)}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${category === c ? 'bg-[#7B1A1A] text-[#F5C518] font-bold' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-[#231508]'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mb-2">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#231508] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#231508] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mb-2">Min Rating</label>
              <div className="space-y-1.5">
                {['4', '3', '2'].map((r) => (
                  <button key={r} onClick={() => setParam('minRating', r)}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${minRating === r ? 'bg-[#7B1A1A] text-[#F5C518] font-bold' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-[#231508]'}`}>
                    <Star className="w-3 h-3 fill-[#E6A817] text-[#E6A817]" /> {r}+ Stars
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            <div>
              <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mb-2">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {category && <span className="px-2 py-1 bg-[#7B1A1A]/10 border border-[#7B1A1A]/30 rounded-lg text-xs text-[#7B1A1A] dark:text-amber-300 flex items-center gap-1">{category} <button onClick={() => setParam('category', '')}><X className="w-3 h-3" /></button></span>}
                {keyword && <span className="px-2 py-1 bg-[#7B1A1A]/10 border border-[#7B1A1A]/30 rounded-lg text-xs text-[#7B1A1A] dark:text-amber-300 flex items-center gap-1">"{keyword}" <button onClick={() => setParam('keyword', '')}><X className="w-3 h-3" /></button></span>}
                {(category || keyword || minPrice || maxPrice || minRating) && (
                  <button onClick={clearFilters} className="text-xs text-rose-600 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Quick Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setParam('category', '')}
          className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${!category ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50'}`}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setParam('category', c)}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${category === c ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-product overflow-hidden">
              <div className="aspect-square bg-amber-100 dark:bg-[#231508] animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-amber-100 dark:bg-[#231508] rounded animate-pulse w-1/3"></div>
                <div className="h-4 bg-amber-100 dark:bg-[#231508] rounded animate-pulse"></div>
                <div className="h-3 bg-amber-100 dark:bg-[#231508] rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="text-6xl">🍛</div>
          <h3 className="text-lg font-bold text-amber-950 dark:text-amber-50">No products found</h3>
          <p className="text-sm text-amber-700 dark:text-amber-400">Try different filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary px-6 py-2.5 text-sm rounded-full">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <button onClick={() => setParam('page', page - 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50">
              ← Prev
            </button>
          )}
          {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).slice(0, 5).map((p) => (
            <button key={p} onClick={() => setParam('page', p)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${page === p ? 'bg-[#7B1A1A] text-[#F5C518] border-[#7B1A1A]' : 'border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50'}`}>
              {p}
            </button>
          ))}
          {page < Math.ceil(total / 12) && (
            <button onClick={() => setParam('page', page + 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-200 dark:border-[#3D2010] text-amber-900 dark:text-amber-200 hover:border-[#E6A817]/50">
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
