import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf, ShieldCheck, Award, Users, ChevronRight, ArrowRight } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">About Naivadyam</span>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F0600] via-[#3D1206] to-[#1A0800] border border-[#3D1206] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6A817]/10 border border-[#E6A817]/30 text-[#E6A817] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> The Divine Serve Since 1998
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-amber-100 leading-tight">
          Purity in Every Grain.<br />
          <span className="text-[#E6A817]">Devotion in Every Meal.</span>
        </h1>
        <p className="text-sm sm:text-base text-amber-300/80 max-w-2xl mx-auto leading-relaxed">
          Rooted in ancient Indian culinary traditions, <strong>Naivadyam (नैवेद्यम्)</strong> brings authentic temple-grade purity, stone-ground premixes, and traditional delicacies directly to your kitchen.
        </p>
        <div className="pt-2">
          <img src="/naivadyam-logo.png" alt="Naivadyam Emblem" className="h-16 mx-auto object-contain drop-shadow-xl" />
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { metric: '25+', label: 'Years of Heritage', sub: 'Traditional recipes' },
          { metric: '100k+', label: 'Happy Households', sub: 'Across India' },
          { metric: '100%', label: 'Pure Vegetarian', sub: 'Zero preservatives' },
          { metric: '4.9★', label: 'Customer Rating', sub: 'Over 12,000+ reviews' },
        ].map((item, idx) => (
          <div key={idx} className="card-product p-6 space-y-1.5 border border-amber-500/20">
            <p className="text-3xl font-black text-[#7B1A1A] dark:text-[#E6A817]">{item.metric}</p>
            <p className="text-xs font-bold text-amber-950 dark:text-amber-100">{item.label}</p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Our Story & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-amber-950 dark:text-amber-50">
            The Philosophy of <span className="text-[#7B1A1A] dark:text-[#E6A817]">Naivadyam</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
            In Sanskrit, <em>Naivadyam</em> represents the sacred food offering presented to the Divine before partaking. We believe food is not merely nourishment, but a sacred experience.
          </p>
          <p className="text-xs sm:text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
            Every Idli, Medu Wada, and Dhokla premix we craft is prepared using traditional stone-grinding methods, retaining natural nutrients, rich textures, and authentic flavors without soda or artificial additives.
          </p>
        </div>
        <div className="card-product p-6 space-y-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-[#1A0E08] dark:to-[#2A1408]">
          <h3 className="font-bold text-amber-950 dark:text-amber-50 text-base">Our Core Promises:</h3>
          <div className="space-y-3">
            {[
              { title: 'Stone-Ground Authenticity', desc: 'Slow-milled grains preserving traditional aroma and texture.', icon: <Award className="w-5 h-5 text-amber-500" /> },
              { title: 'Natural & Chemical-Free', desc: 'Zero artificial preservatives, synthetic colors, or MSG.', icon: <Leaf className="w-5 h-5 text-[#1D7A40]" /> },
              { title: 'FSSAI Hygiene Standards', desc: 'Packaged in ISO-certified cleanroom fulfillment centers.', icon: <ShieldCheck className="w-5 h-5 text-amber-500" /> },
            ].map((p, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-white/70 dark:bg-black/30 rounded-xl">
                <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">{p.icon}</div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">{p.title}</h4>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner CTA */}
      <div className="p-8 bg-gradient-to-r from-[#7B1A1A] to-[#3D1206] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-black text-[#F5C518]">Taste the Sacred Tradition</h3>
          <p className="text-xs text-amber-200/90 max-w-lg">Explore our pure instant premix collection and prepare authentic South Indian & Maharashtrian delicacies in minutes.</p>
        </div>
        <Link to="/catalog" className="btn-gold px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 whitespace-nowrap shadow-lg">
          Explore Our Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AboutUsPage;
