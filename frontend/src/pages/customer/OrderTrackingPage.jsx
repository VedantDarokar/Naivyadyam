import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import OrderTimeline from '../../components/customer/OrderTimeline';
import { socket } from '../../services/socket';
import { Package, Download, RotateCcw, XCircle, ArrowLeft, ShieldCheck, MapPin, Truck, Phone } from 'lucide-react';
import api from '../../services/api';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Socket.IO real-time subscription
    socket.emit('join_order_room', id);

    const handleRealtimeUpdate = (updatedData) => {
      console.log('Realtime socket update received:', updatedData);
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: updatedData.orderStatus || prev.orderStatus,
          paymentStatus: updatedData.paymentStatus || prev.paymentStatus,
          statusHistory: updatedData.statusHistory || prev.statusHistory,
          trackingDetails: updatedData.trackingDetails || prev.trackingDetails
        };
      });
      showToast(`Real-Time Order Update: Status is now "${updatedData.orderStatus}"`, 'info');
    };

    socket.on('order_status_updated', handleRealtimeUpdate);

    return () => {
      socket.emit('leave_order_room', id);
      socket.off('order_status_updated', handleRealtimeUpdate);
    };
  }, [id]);

  const handleDownloadInvoice = async () => {
    try {
      showToast('Preparing PDF Invoice...', 'info');
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Naivadyam-Invoice-${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Error downloading invoice PDF', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      setOrder(data);
      showToast('Order cancelled', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error cancelling order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/orders/${id}/return`, { reason: returnReason });
      setOrder(data);
      showToast('Return request submitted for admin review', 'success');
      setReturnModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting return request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Connecting to Realtime Order Tracking Server...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Order Not Found</h2>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

  const canCancel = ['Placed', 'Confirmed'].includes(order.orderStatus);
  const canReturn = order.orderStatus === 'Delivered';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button onClick={() => navigate('/profile?tab=orders')} className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Order #{order._id.slice(-8).toUpperCase()}
            <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
              Live Real-Time Socket Tracking
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-500" /> Download PDF Invoice
          </button>

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-rose-500/20"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}

          {canReturn && (
            <button
              onClick={() => setReturnModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Request Return/Refund
            </button>
          )}
        </div>
      </div>

      {/* Realtime Timeline Stepper Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <OrderTimeline
          orderStatus={order.orderStatus}
          statusHistory={order.statusHistory}
          trackingDetails={order.trackingDetails}
        />
      </div>

      {/* Grid: Address Info & Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Items Table */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Items in this Order ({order.orderItems.length})
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-xl bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" /> Delivery Address
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
            <p className="font-bold text-slate-900 dark:text-white">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-amber-600 dark:text-amber-400 font-semibold pt-1">Ph: {order.shippingAddress.phone}</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-900 dark:text-white">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-500">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Paid:</span>
              <span className="text-amber-600 dark:text-amber-400">₹{order.priceBreakup.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Return / Refund Request</h3>
            <form onSubmit={handleRequestReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Reason for Return</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows="4"
                  placeholder="Please state why you want to return or replace this item..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReturnModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
