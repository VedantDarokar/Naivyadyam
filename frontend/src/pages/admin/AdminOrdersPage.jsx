import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../../context/AuthContext';
import { Truck, Search, Eye, Filter, RefreshCw, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Package, DollarSign, X, ExternalLink, Calendar, CreditCard, User, Tag } from 'lucide-react';
import api from '../../services/api';

const AdminOrdersPage = () => {
  const { showToast } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [viewingOrder, setViewingOrder] = useState(null); // Full details modal
  const [selectedOrder, setSelectedOrder] = useState(null); // Status update modal
  const [updatingId, setUpdatingId] = useState(null);

  // Status update modal state
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [courierName, setCourierName] = useState('Express FastTrack Logistics');
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
      if (viewingOrder?._id === orderId) setViewingOrder(updatedOrder);
      showToast(`Order status updated to "${newStatus}" & Socket.IO event broadcasted!`, 'success');
      setSelectedOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const ordId = ord._id ? ord._id.toString().toLowerCase() : '';
    const custName = (ord.user?.name || ord.shippingAddress?.fullName || ord.shippingAddress?.name || '').toLowerCase();
    const custEmail = (ord.user?.email || ord.shippingAddress?.email || '').toLowerCase();
    const custPhone = (ord.user?.phone || ord.shippingAddress?.phone || '').toLowerCase();
    const city = (ord.shippingAddress?.city || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return ordId.includes(query) || custName.includes(query) || custEmail.includes(query) || custPhone.includes(query) || city.includes(query);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Command Center</h1>
          <p className="text-xs text-slate-400">
            Comprehensive order records, customer contact details, items breakdown & live status tracking
          </p>
        </div>

        {/* Filter & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, name, email, phone, city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses ({orders.length})</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading order records...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No orders match your search query or filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4">Amount & Payment</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord) => {
                  const ordIdStr = ord._id ? ord._id.toString().slice(-8).toUpperCase() : 'N/A';
                  const totalAmt = ord.priceBreakup?.total ?? ord.totalAmount ?? 0;
                  const customerName = ord.user?.name || ord.shippingAddress?.fullName || ord.shippingAddress?.name || 'Customer';
                  const customerEmail = ord.user?.email || ord.shippingAddress?.email || 'N/A';
                  const customerPhone = ord.user?.phone || ord.shippingAddress?.phone || 'N/A';
                  const itemCount = (ord.orderItems || ord.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                  return (
                    <tr key={ord._id || Math.random()} className="hover:bg-slate-800/40 transition-colors">
                      {/* Order ID & Date */}
                      <td className="px-6 py-4 font-mono">
                        <span className="font-bold text-amber-400">#{ordIdStr}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{customerName}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {customerEmail}
                        </p>
                        <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" /> {customerPhone}
                        </p>
                      </td>

                      {/* Items Summary */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {(ord.orderItems || ord.items || []).map(i => i.title || i.name).join(', ')}
                        </p>
                      </td>

                      {/* Amount & Payment */}
                      <td className="px-6 py-4">
                        <p className="font-black text-white text-sm">₹{totalAmt.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-0.5 mt-1 rounded font-bold text-[10px] ${
                          ord.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ord.paymentStatus || 'Pending'} ({ord.paymentMethod || 'COD'})
                        </span>
                      </td>

                      {/* Current Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 font-bold text-[10px] rounded-full uppercase border ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {ord.orderStatus || 'Placed'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View All Details Button */}
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                            title="View Full Order & Customer Details"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>

                          {/* Update Status Button */}
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setNewStatus(ord.orderStatus || 'Placed');
                              if (ord.trackingDetails) {
                                setCourierName(ord.trackingDetails.courierName || 'Express FastTrack Logistics');
                                setTrackingId(ord.trackingDetails.trackingId || '');
                                setCurrentLocation(ord.trackingDetails.currentLocation || '');
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {viewingOrder && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
            
            {/* Header (Fixed) */}
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Complete Order Specification</span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  Order #{viewingOrder._id ? viewingOrder._id.toString().slice(-8).toUpperCase() : 'N/A'}
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                    viewingOrder.orderStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {viewingOrder.orderStatus || 'Placed'}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Placed on {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-300">
              
              {/* Grid 1: Customer Contact & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Customer Contact Card */}
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Customer Contact Information
                  </h4>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Full Name</span>
                      <p className="font-bold text-white text-sm">
                        {viewingOrder.user?.name || viewingOrder.shippingAddress?.fullName || viewingOrder.shippingAddress?.name || 'Guest Customer'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Email Address</span>
                      <a
                        href={`mailto:${viewingOrder.user?.email || viewingOrder.shippingAddress?.email || ''}`}
                        className="text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Mail className="w-3 h-3 text-slate-400" />
                        {viewingOrder.user?.email || viewingOrder.shippingAddress?.email || 'N/A'}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Phone / Mobile</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <a
                          href={`tel:${viewingOrder.user?.phone || viewingOrder.shippingAddress?.phone || '8149471804'}`}
                          className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {viewingOrder.user?.phone || viewingOrder.shippingAddress?.phone || '8149471804'}
                        </a>
                        <a
                          href={`https://wa.me/${(viewingOrder.user?.phone || viewingOrder.shippingAddress?.phone || '8149471804').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500/20"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Card */}
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address & Destination
                  </h4>
                  
                  {viewingOrder.shippingAddress ? (
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-bold text-white">{viewingOrder.shippingAddress.fullName || viewingOrder.shippingAddress.name}</p>
                      <p className="text-slate-300">{viewingOrder.shippingAddress.address || viewingOrder.shippingAddress.street}</p>
                      {viewingOrder.shippingAddress.landmark && (
                        <p className="text-slate-400 text-[11px]">Landmark: {viewingOrder.shippingAddress.landmark}</p>
                      )}
                      <p className="font-semibold text-slate-200">
                        {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} — <span className="text-amber-400 font-mono">{viewingOrder.shippingAddress.pincode}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No detailed shipping address recorded.</p>
                  )}
                </div>
              </div>

              {/* Grid 2: Ordered Items */}
              <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Order Items ({ (viewingOrder.orderItems || viewingOrder.items || []).length })
                </h4>

                <div className="divide-y divide-slate-700/60">
                  {(viewingOrder.orderItems || viewingOrder.items || []).map((item, idx) => {
                    const title = item.title || item.name || 'Naivadyam Premix Product';
                    const price = item.price || 0;
                    const qty = item.quantity || item.qty || 1;
                    const img = item.image || item.images?.[0] || '/naivadyam-logo.png';
                    return (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={img} alt={title} className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{title}</p>
                            <p className="text-[10px] text-slate-400">Qty: <span className="font-bold text-amber-300">{qty}</span> &nbsp;·&nbsp; ₹{price} each</p>
                          </div>
                        </div>
                        <p className="font-bold text-white text-sm shrink-0">₹{(price * qty).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 3: Financial Breakup & Tracking Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Payment & Price Summary */}
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Payment & Financial Breakdown
                  </h4>
                  
                  <div className="space-y-1.5 pt-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <span className="font-bold text-white">{viewingOrder.paymentMethod || 'Cash on Delivery (COD)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status</span>
                      <span className="font-bold text-emerald-400">{viewingOrder.paymentStatus || 'Pending COD Collection'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700/60 pt-1.5">
                      <span>Subtotal</span>
                      <span>₹{(viewingOrder.priceBreakup?.subtotal ?? viewingOrder.totalAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Charges</span>
                      <span className="text-emerald-400">
                        {(viewingOrder.priceBreakup?.shipping || 0) === 0 ? 'FREE' : `₹${viewingOrder.priceBreakup.shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-white border-t border-slate-700 pt-1.5">
                      <span>Total Amount Payable</span>
                      <span className="text-amber-400">₹{(viewingOrder.priceBreakup?.total ?? viewingOrder.totalAmount ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Logistics & Tracking Card */}
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Logistics & Tracking Details
                  </h4>

                  <div className="space-y-1.5 pt-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Courier Partner</span>
                      <span className="font-bold text-white">{viewingOrder.trackingDetails?.courierName || 'Express Logistics'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking ID</span>
                      <span className="font-mono font-bold text-amber-400">{viewingOrder.trackingDetails?.trackingId || 'TRK-PENDING'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Hub</span>
                      <span className="text-slate-300">{viewingOrder.trackingDetails?.currentLocation || 'Main Hub Fulfillment Center'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Fixed Footer */}
            <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setSelectedOrder(viewingOrder);
                  setNewStatus(viewingOrder.orderStatus || 'Placed');
                  if (viewingOrder.trackingDetails) {
                    setCourierName(viewingOrder.trackingDetails.courierName || 'Express FastTrack Logistics');
                    setTrackingId(viewingOrder.trackingDetails.trackingId || '');
                    setCurrentLocation(viewingOrder.trackingDetails.currentLocation || '');
                  }
                  setViewingOrder(null);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Truck className="w-4 h-4" /> Update Tracking & Status →
              </button>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* STATUS UPDATE & TRACKING BROADCAST MODAL */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
            
            {/* Header (Fixed) */}
            <div className="p-6 pb-4 border-b border-slate-800 flex items-start justify-between shrink-0">
              <div className="pr-6">
                <h3 className="text-base font-black text-white">
                  Update Tracking & Status for Order #{selectedOrder._id ? selectedOrder._id.toString().slice(-8).toUpperCase() : 'N/A'}
                </h3>
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                  Customer: {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.name || 'Customer'} ({selectedOrder.user?.email || selectedOrder.shippingAddress?.email || 'Guest'})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-300">
              <div>
                <label className="block font-semibold mb-1 text-slate-400">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white focus:outline-none focus:border-amber-500"
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
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Current Hub Location</label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-400">Status Update Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package dispatched from Bandra hub"
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder._id)}
                disabled={updatingId === selectedOrder._id}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors"
              >
                {updatingId === selectedOrder._id ? 'Broadcasting Realtime Socket...' : 'Broadcast & Save Status'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminOrdersPage;
