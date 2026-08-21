import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Trash2, Edit3, Search, ShoppingBag, X, Check } from 'lucide-react';
import api from '../../services/api';

const AdminProductsPage = () => {
  const { showToast } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Gourmet & Sweets');
  const [brand, setBrand] = useState('Naivadyam');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDealOfDay, setIsDealOfDay] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products?pageSize=50';
      if (search) url += `&keyword=${encodeURIComponent(search)}`;
      const { data } = await api.get(url);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditProduct(null);
    setTitle('');
    setCategory('Gourmet & Sweets');
    setBrand('Naivadyam');
    setPrice('');
    setCompareAtPrice('');
    setStock('50');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600');
    setIsFeatured(false);
    setIsDealOfDay(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setBrand(p.brand || 'Naivadyam');
    setPrice(p.price);
    setCompareAtPrice(p.compareAtPrice);
    setStock(p.stock);
    setDescription(p.description);
    setImageUrl(p.images?.[0] || '');
    setIsFeatured(p.isFeatured || false);
    setIsDealOfDay(p.isDealOfDay || false);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        category,
        brand,
        price: Number(price),
        compareAtPrice: Number(compareAtPrice || price),
        stock: Number(stock),
        description,
        images: [imageUrl || 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600'],
        isFeatured,
        isDealOfDay
      };

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showToast('New product created successfully', 'success');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      showToast('Product removed', 'info');
    } catch (err) {
      showToast('Error deleting product', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Product Inventory Catalog</h1>
          <p className="text-xs text-slate-400">Manage SKUs, stock levels, category listings, and pricing</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKUs..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading catalog items...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Item Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Badges</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt={p.title} className="w-10 h-10 object-cover rounded-xl bg-slate-800" />
                        <div>
                          <p className="font-bold text-white max-w-xs truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-400">{p.sku || 'SKU-001'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{p.category}</td>
                    <td className="px-6 py-4 font-black text-white">₹{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.stock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {p.isFeatured && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">Featured</span>}
                        {p.isDealOfDay && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">Flash Deal</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-amber-400 hover:bg-slate-800 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-4 text-xs text-slate-300 relative my-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white pt-1">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-400 font-semibold">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400 font-semibold">Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400 font-semibold">Brand</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400 font-semibold">Selling Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400 font-semibold">MRP (₹)</label>
                  <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400 font-semibold">Stock Quantity</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-slate-400 font-semibold">Image URL</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-slate-400 font-semibold">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-amber-500" />
                  <span>Featured Item</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isDealOfDay} onChange={(e) => setIsDealOfDay(e.target.checked)} className="accent-amber-500" />
                  <span>Deal of Day</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
