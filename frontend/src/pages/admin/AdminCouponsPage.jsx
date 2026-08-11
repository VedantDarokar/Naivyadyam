import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const AdminCouponsPage = () => {
  const { showToast } = useContext(AuthContext);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('500');
  const [maxDiscount, setMaxDiscount] = useState('500');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/coupons');
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/coupons', {
        code,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount
      });
      setCoupons([data, ...coupons]);
      showToast('Coupon created successfully', 'success');
      setModalOpen(false);
      setCode('');
    } catch (err) {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      showToast('Coupon deleted', 'info');
    } catch (err) {
      showToast('Error deleting coupon', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Coupons & Promo Manager</h1>
          <p className="text-xs text-slate-400">Configure discount codes, flat offers, and minimum cart spend rules</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Order Value</th>
                  <th className="px-6 py-4">Times Used</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-amber-400">{c.code}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="px-6 py-4">₹{c.minOrderValue}</td>
                    <td className="px-6 py-4">{c.usedCount || 0} times</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteCoupon(c._id)} className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-xs text-slate-300 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white">Create Promo Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block mb-1 font-semibold text-slate-400">Coupon Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="e.g. FESTIVE20" className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-400">Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-400">Discount Value</label>
                  <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-slate-400">Min Spend (₹)</label>
                  <input type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-400">Max Discount (₹)</label>
                  <input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
