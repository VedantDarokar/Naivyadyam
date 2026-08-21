import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, CreditCard, ShieldCheck, ChevronRight, HelpCircle, ArrowLeftRight } from 'lucide-react';

const RefundPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">Refund Policy</span>
      </div>

      {/* Header Banner */}
      <div className="card-product p-8 relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1D7A40]/10 rounded-2xl text-[#1D7A40]">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Refund Policy</h1>
            <p className="text-xs text-amber-700 dark:text-amber-400">Transparent, Prompt & Hassle-Free Refunds</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Quick Processing', desc: 'Refunds initiated within 24 hours of return approval.', icon: <Clock className="w-5 h-5 text-emerald-500" /> },
          { title: 'Multiple Refund Modes', desc: 'Direct bank transfer or instant store credit.', icon: <CreditCard className="w-5 h-5 text-emerald-500" /> },
          { title: '100% Refund Assurance', desc: 'Full refund for cancelled pre-shipment orders.', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
        ].map((item, idx) => (
          <div key={idx} className="bg-emerald-500/5 border border-emerald-500/15 p-5 rounded-2xl space-y-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl w-fit">{item.icon}</div>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">{item.title}</h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Policy Details */}
      <div className="card-product p-8 space-y-8 text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1D7A40]" /> 1. Refund Eligibility
          </h2>
          <p>
            At <strong>Naivadyam</strong>, we value your trust. You are eligible for a complete or partial refund under the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li>Order cancelled before shipment dispatch.</li>
            <li>Item verified as damaged, defective, or missing during transit inspection.</li>
            <li>Shipment undelivered due to logistics errors on our end.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-500" /> 2. Refund Processing Timelines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-200 dark:border-[#3D2010] bg-amber-50 dark:bg-[#1A0E08]">
                  <th className="p-3 font-bold text-amber-950 dark:text-amber-100">Payment Method</th>
                  <th className="p-3 font-bold text-amber-950 dark:text-amber-100">Refund Destination</th>
                  <th className="p-3 font-bold text-amber-950 dark:text-amber-100">Estimated SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-[#2A1A0C]">
                <tr>
                  <td className="p-3 font-semibold">Cash on Delivery (COD)</td>
                  <td className="p-3 text-amber-700 dark:text-amber-400">Direct Bank NEFT / UPI Transfer</td>
                  <td className="p-3 font-bold text-[#1D7A40]">24 – 48 Business Hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Online Payments (UPI/Card)</td>
                  <td className="p-3 text-amber-700 dark:text-amber-400">Original Payment Source</td>
                  <td className="p-3 font-bold text-[#1D7A40]">3 – 5 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Store Credit / Gift Coupon</td>
                  <td className="p-3 text-amber-700 dark:text-amber-400">Naivadyam Wallet Balance</td>
                  <td className="p-3 font-bold text-[#1D7A40]">Instant (Within 1 Hour)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> 3. Cancellation Policy
          </h2>
          <p>
            Orders can be cancelled free of charge at any time prior to shipment dispatch. Once the parcel is packed and handed over to our express courier partner, cancellations are subject to return verification upon package arrival.
          </p>
        </section>

        {/* Support Banner */}
        <div className="p-6 bg-gradient-to-r from-[#1D7A40]/10 to-amber-500/10 rounded-2xl border border-[#1D7A40]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-amber-950 dark:text-amber-50 text-sm">Have Questions Regarding a Refund?</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">Provide your Order ID to our support desk for instant tracking.</p>
          </div>
          <Link to="/contact-us" className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold whitespace-nowrap">
            Check Refund Status →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
