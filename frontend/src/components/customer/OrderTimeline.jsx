import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, MapPin, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

const OrderTimeline = ({ orderStatus, statusHistory = [], trackingDetails = {} }) => {
  const steps = [
    { key: 'Placed', label: 'Order Placed', icon: ShoppingBag, desc: 'Order details received' },
    { key: 'Confirmed', label: 'Confirmed', icon: ShieldCheck, desc: 'Payment & inventory verified' },
    { key: 'Packed', label: 'Packed', icon: PackageCheck, desc: 'Packed at fulfillment center' },
    { key: 'Shipped', label: 'In Transit', icon: Truck, desc: 'Handed over to courier' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Agent out for delivery' },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Successfully delivered' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Confirmed': return 1;
      case 'Packed': return 2;
      case 'Shipped': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(orderStatus);

  if (orderStatus === 'Cancelled') {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-6 rounded-2xl flex items-center gap-4 text-rose-700 dark:text-rose-300">
        <AlertCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-base">This Order Has Been Cancelled</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
            If any payment was deducted, your refund will be processed back to your original payment mode within 3-5 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Horizontal Stepper Progress Bar */}
      <div className="relative py-4">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 hidden md:block">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 scale-110 animate-pulse-glow font-bold'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold mt-2.5 ${isCurrent ? 'text-amber-600 dark:text-amber-400' : isPassed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] hidden sm:block">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier & Tracking Details Card */}
      {trackingDetails && trackingDetails.trackingId && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Carrier Partner & Tracking ID</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {trackingDetails.courierName} — <span className="font-mono text-amber-600 dark:text-amber-400">{trackingDetails.trackingId}</span>
              </h4>
            </div>
          </div>
          {trackingDetails.currentLocation && (
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Hub Location</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{trackingDetails.currentLocation}</p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Activity Logs */}
      {statusHistory.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Status Activity Log</h4>
          <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            {statusHistory.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs border-b border-slate-100 dark:border-slate-800/60 last:border-0 pb-2.5 last:pb-0">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.status}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {item.note && <p className="text-slate-500 mt-0.5">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
