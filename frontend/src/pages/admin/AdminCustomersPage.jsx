import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, ShieldOff, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../services/api';
import { getInitials } from '../../utils/getInitials';

const AdminCustomersPage = () => {
  const { showToast } = useContext(AuthContext);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/admin/customers/${id}/block`);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isBlocked: data.isBlocked } : c))
      );
      showToast(data.message, 'info');
    } catch (err) {
      showToast('Error modifying customer status', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Registered Customer Management</h1>
        <p className="text-xs text-slate-400">View user accounts, order activity, and access permissions</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Loyalty Points</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-[#7B1A1A] text-amber-100 flex items-center justify-center font-black text-xs shadow flex-shrink-0">
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <p>{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal">Joined: {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{c.email}</p>
                      <p className="text-slate-400">{c.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400">
                      🏆 {c.loyaltyPoints || 0} Points
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        c.isBlocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {c.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(c._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          c.isBlocked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        }`}
                      >
                        {c.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
