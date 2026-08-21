import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Leaf, Shield, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

const DisclaimerPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">Disclaimer & Terms</span>
      </div>

      {/* Header Banner */}
      <div className="card-product p-8 relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Disclaimer & Usage Terms</h1>
            <p className="text-xs text-amber-700 dark:text-amber-400">Product Standards, FSSAI Compliance & Ingredient Transparency</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-product p-8 space-y-8 text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#1D7A40]" /> 1. Pure Vegetarian & Food Safety Standard
          </h2>
          <p>
            All products crafted by <strong>Naivadyam — The Divine Serve</strong> are 100% Pure Vegetarian, prepared in dedicated food-grade processing units adhering to FSSAI standards. Our premixes and sweets are crafted without artificial food dyes, synthetic preservatives, or animal-derived ingredients.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 2. Allergen & Cross-Contamination Notice
          </h2>
          <p>
            While we maintain strict sanitation protocols, our production facility processes traditional Indian grains and ingredients. Products may contain or come into contact with:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li>Tree nuts (Cashews, Almonds, Pistachios, Walnuts).</li>
            <li>Dairy products (Pure Desi Ghee, Milk Powder).</li>
            <li>Gluten, Wheat, Sesame, and Mustard seeds.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> 3. Storage & Best-Before Guidelines
          </h2>
          <p>
            To enjoy maximum freshness and flavor:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li>Store unopened premix pouches in a cool, dry place away from direct sunlight.</li>
            <li>Once opened, transfer remaining contents into a clean, airtight container.</li>
            <li>Consume prepared items prior to the Best-Before date printed on the pouch packaging.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1D7A40]" /> 4. Intellectual Property
          </h2>
          <p>
            All brand assets, including the <strong>Naivadyam</strong> name, logo, banana leaf iconography, product imagery, and recipes, are registered intellectual property. Reproduction without explicit written authorization is prohibited.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DisclaimerPage;
