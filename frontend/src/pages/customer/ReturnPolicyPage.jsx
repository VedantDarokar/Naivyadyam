import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Truck, CheckCircle2, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';

const ReturnPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">Return & Exchange Policy</span>
      </div>

      {/* Header Banner */}
      <div className="card-product p-8 relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B1A1A]/10 dark:bg-[#E6A817]/10 rounded-2xl text-[#7B1A1A] dark:text-[#E6A817]">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Return & Exchange Policy</h1>
            <p className="text-xs text-amber-700 dark:text-amber-400">Our 7-Day Satisfaction & Quality Guarantee</p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '7-Day Return Window', desc: 'Raise a return within 7 days of package delivery.', icon: <RotateCcw className="w-5 h-5 text-amber-500" /> },
          { title: 'Free Pickups', desc: 'Zero pickup charges for damaged or incorrect products.', icon: <Truck className="w-5 h-5 text-amber-500" /> },
          { title: '100% Quality Promise', desc: 'Instant replacement for items damaged during transit.', icon: <ShieldCheck className="w-5 h-5 text-amber-500" /> },
        ].map((item, idx) => (
          <div key={idx} className="bg-amber-500/5 border border-amber-500/15 p-5 rounded-2xl space-y-2">
            <div className="p-2 bg-amber-500/10 rounded-xl w-fit">{item.icon}</div>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">{item.title}</h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Policy Content */}
      <div className="card-product p-8 space-y-8 text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1D7A40]" /> 1. Eligible Conditions for Return
          </h2>
          <p>
            At <strong>Naivadyam — The Divine Serve</strong>, we uphold the highest standards of food hygiene and quality. Because our products consist of food items and instant premixes, returns are accepted under the following verified conditions:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li>Product arrived damaged, leaking, or crushed during transit.</li>
            <li>Package seal was tampered with or broken upon delivery.</li>
            <li>Incorrect item or weight variant dispatched compared to invoice.</li>
            <li>Item delivered past its printed Best-Before date.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> 2. Non-Returnable Items
          </h2>
          <p>
            In compliance with FSSAI (Food Safety and Standards Authority of India) food safety regulations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li>Opened or partially consumed food pouches cannot be returned due to hygiene protocols.</li>
            <li>Returns requested beyond the 7-day post-delivery window.</li>
            <li>Products damaged due to improper home storage (e.g., exposure to moisture or sunlight).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> 3. How to Request a Return
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-amber-50 dark:bg-[#1A0E08] rounded-xl border border-amber-200 dark:border-[#3D2010] space-y-1">
              <span className="font-bold text-amber-950 dark:text-amber-100">Step 1: Contact Support</span>
              <p className="text-amber-700 dark:text-amber-400">Email <strong>naivyadyamtds@gmail.com</strong> or raise a ticket via your profile within 7 days of delivery.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-[#1A0E08] rounded-xl border border-amber-200 dark:border-[#3D2010] space-y-1">
              <span className="font-bold text-amber-950 dark:text-amber-100">Step 2: Provide Photos / Details</span>
              <p className="text-amber-700 dark:text-amber-400">Attach a photo or video showing the outer package label and the issue (e.g. damaged seal or wrong item).</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-[#1A0E08] rounded-xl border border-amber-200 dark:border-[#3D2010] space-y-1">
              <span className="font-bold text-amber-950 dark:text-amber-100">Step 3: Free Pickup & Replacement</span>
              <p className="text-amber-700 dark:text-amber-400">Our courier team will arrange reverse pickup within 48 hours and dispatch a fresh replacement free of charge.</p>
            </div>
          </div>
        </section>

        {/* Support Callout */}
        <div className="p-6 bg-gradient-to-r from-[#7B1A1A]/10 to-[#E6A817]/10 rounded-2xl border border-[#E6A817]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-amber-950 dark:text-amber-50 text-sm">Need Help With Your Return?</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">Our customer care team is available Mon – Sat (9am to 8pm IST).</p>
          </div>
          <Link to="/contact-us" className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold whitespace-nowrap">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
