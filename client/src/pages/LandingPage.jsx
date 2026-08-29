import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, TrendingUp } from 'lucide-react';

export default function LandingPage({ onSelectRole }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-ann-brand text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Surplus Food Priority Routing</span>
        </div>
        <h1 className="font-serif-title text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15] mb-6">
          Food is sacred. <br className="hidden sm:inline" />
          <span className="italic text-ann-brand">Zero waste</span> in our cities.
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
          Ann instantly routes fresh banquet, bakery, and restaurant surplus to verified shelters & animal rescue feeders through an urgency-priority algorithm before it expires.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
        <div className="group relative bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xl hover:shadow-2xl hover:border-ann-brand/40 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-amber-50 text-ann-brand flex items-center justify-center font-bold text-xl">
            🍲
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ann-brand">For Businesses & Homes</span>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-2 mb-3">
              I Want to Donate Food
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
              Post fresh surplus in under 30 seconds. Automatic FSSAI verification badges, live pickup tracking, and environmental impact certificates.
            </p>
          </div>
          <button
            onClick={() => onSelectRole('donor')}
            className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-ann-brand text-white font-bold text-sm flex items-center justify-between group-hover:shadow-lg transition-all"
          >
            <span>Start as Food Donor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="group relative bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xl hover:shadow-2xl hover:border-emerald-600/40 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
            🤝
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">For Shelters & Rescue</span>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-2 mb-3">
              I'm an NGO / Volunteer
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
              Claim prioritized donations on our live radar map. Zero dead-claims with real-time GPS volunteer dispatch.
            </p>
          </div>
          <button
            onClick={() => onSelectRole('ngo')}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-between group-hover:shadow-lg transition-all"
          >
            <span>Claim on NGO Radar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 text-left">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-stone-200">
          <Zap className="w-6 h-6 text-amber-500 mb-2" />
          <h4 className="font-bold text-stone-900 text-sm mb-1">Priority Engine</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Ranked by proximity and expiry time so warm cooked food reaches hunger points before spoiling.
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-stone-200">
          <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
          <h4 className="font-bold text-stone-900 text-sm mb-1">Double Verification</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            FSSAI check for commercial kitchens + verified NGO registration gatekeeping.
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-stone-200">
          <TrendingUp className="w-6 h-6 text-ann-brand mb-2" />
          <h4 className="font-bold text-stone-900 text-sm mb-1">CO₂ & Meals Metrics</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Gamified badges and shareable environmental statistics celebrating zero-hunger contributions.
          </p>
        </div>
      </div>
    </div>
  );
}