import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, AlertTriangle, ArrowUpRight, TrendingUp, Package } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-400">Loading Admin Dashboard Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Executive Sales & Analytics Dashboard</h1>
          <p className="text-xs text-slate-400">Real-time performance metrics and store inventory health</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
          Live Store Analytics
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              Real-time
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Net Revenue</p>
            <h3 className="text-2xl font-black text-white mt-1">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              Real-time
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Orders Processed</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              Real-time
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Active Customers</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalCustomers || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400">{stats?.lowStockProducts?.length || 0} Alerts</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Catalog SKUs</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalProducts || 0}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" /> Revenue & Growth Performance Trend
            </h3>
            <p className="text-xs text-slate-400">Monthly sales progression (in INR)</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Inventory Alerts
          </h3>
          {stats?.lowStockProducts?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">All product SKUs have healthy stock levels.</p>
          ) : (
            <div className="space-y-3">
              {stats?.lowStockProducts?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.images?.[0]} alt={item.title} className="w-10 h-10 object-cover rounded-xl" />
                    <div>
                      <p className="font-bold text-white max-w-[200px] truncate">{item.title}</p>
                      <p className="text-slate-400">Category: {item.category}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-black rounded-full border border-rose-500/30">
                    Only {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs text-amber-400 hover:underline">
              View All Orders →
            </Link>
          </div>

          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No customer orders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((ord) => (
                <div key={ord._id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl text-xs">
                  <div>
                    <p className="font-mono font-bold text-amber-400">#{ord._id.toString().slice(-8).toUpperCase()}</p>
                    <p className="text-slate-400">{ord.user?.name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{(ord.priceBreakup?.total || ord.totalAmount || 0).toLocaleString()}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{ord.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
