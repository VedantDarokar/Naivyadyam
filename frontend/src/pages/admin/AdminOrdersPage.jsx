import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Truck, Search, Eye, Filter, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AdminOrdersPage = () => {
  const { showToast } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Status update modal state
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [courierName, setCourierName] = useState('Shiprocket Express');
  const [trackingId, setTrackingId] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Central Sorting Hub');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/admin/orders';
      if (statusFilter) url += `?status=${statusFilter}`;
      const { data } = await api.get(url);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      setUpdatingId(orderId);
      const { data: updatedOrder } = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`,
        courierName,
        trackingId: trackingId || 'TRK-' + Date.now().toString().slice(-8),
        currentLocation
      });

      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      showToast(`Order status updated to "${newStatus}" & Socket.IO event broadcasted!`, 'success');
      setSelectedOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Command Center</h1>
          <p className="text-xs text-slate-400">
            Real-time order management. Updating status triggers Socket.IO push to customer tracking screen.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Order Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading orders list...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No orders found for selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-amber-400">
                      #{ord._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{ord.user?.name || ord.shippingAddress?.name}</p>
                      <p className="text-[10px] text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-white">
                      ₹{ord.priceBreakup?.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        ord.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-full border border-amber-500/30">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.orderStatus);
                          if (ord.trackingDetails) {
                            setCourierName(ord.trackingDetails.courierName || 'Shiprocket');
                            setTrackingId(ord.trackingDetails.trackingId || '');
                            setCurrentLocation(ord.trackingDetails.currentLocation || '');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 text-xs text-slate-300">
            <h3 className="text-base font-bold text-white">
              Update Order Status for #{selectedOrder._id.slice(-8).toUpperCase()}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-400">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Courier Partner Name</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Current Hub Location</label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Status Update Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package dispatched from Bandra hub"
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder._id)}
                disabled={updatingId === selectedOrder._id}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
              >
                {updatingId === selectedOrder._id ? 'Broadcasting Realtime Socket...' : 'Broadcast & Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
