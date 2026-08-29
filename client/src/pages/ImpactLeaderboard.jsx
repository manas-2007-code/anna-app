import React, { useState, useEffect } from 'react';
import { Leaf, ShieldCheck } from 'lucide-react';

export default function ImpactLeaderboard() {
  const [impact, setImpact] = useState({
    totalMealsSaved: 3976,
    totalKgSaved: 1420,
    totalCo2AvertedKg: 3550,
    activeCities: 6
  });

  const [topDonors, setTopDonors] = useState([]);
  const [topNgos, setTopNgos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/impact/summary')
      .then(res => res.json())
      .then(data => setImpact(prev => ({ ...prev, ...data })))
      .catch(() => {});

    fetch('http://localhost:5000/api/leaderboard/donors')
      .then(res => res.json())
      .then(data => setTopDonors(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/leaderboard/ngos')
      .then(res => res.json())
      .then(data => setTopNgos(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-stone-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ann-brand/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold mb-4">
            <Leaf className="w-3.5 h-3.5" /> Verified Public Climate & Hunger Impact
          </div>
          <h2 className="font-serif-title text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Together we turned surplus food into <span className="text-amber-400 font-serif-title italic">{impact.totalMealsSaved.toLocaleString()} meals</span>.
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-xl">
            Redirecting edible surplus directly averts methane emissions while feeding orphanages, migrant settlements, and rescue shelters.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stone-800">
          <div>
            <p className="text-xs text-stone-400 uppercase font-semibold">Meals Saved</p>
            <p className="text-3xl font-extrabold text-white mt-1">{impact.totalMealsSaved.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase font-semibold">Food Diverted</p>
            <p className="text-3xl font-extrabold text-ann-brand mt-1">{impact.totalKgSaved.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase font-semibold">CO₂e Averted</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{impact.totalCo2AvertedKg.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase font-semibold">Active Clusters</p>
            <p className="text-3xl font-extrabold text-amber-300 mt-1">{impact.activeCities} Hubs</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                🏆
              </div>
              <div>
                <h3 className="font-serif-title text-lg font-bold text-stone-900">Top Food Donors</h3>
                <p className="text-xs text-stone-500">Ranked by volume diverted</p>
              </div>
            </div>
            <span className="text-xs font-bold text-ann-brand bg-amber-50 px-2.5 py-1 rounded-full">Monthly</span>
          </div>

          <div className="space-y-3">
            {topDonors.map((donor, idx) => (
              <div key={donor._id || idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition-all border border-stone-100">
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-amber-500' : 'text-stone-400'}`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                      {donor.brandName}
                      {donor.fssaiVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </h4>
                    <span className="text-[10px] text-stone-400">{donor.totalDonationsCount || 10} drop-offs</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-900">{donor.totalKgDonated || 150} kg</span>
                  <span className="block text-[10px] text-amber-600 font-semibold">100 Meals Club</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                🤝
              </div>
              <div>
                <h3 className="font-serif-title text-lg font-bold text-stone-900">Top Rescue & NGO Units</h3>
                <p className="text-xs text-stone-500">Ranked by fast pickup reliability</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Reliability</span>
          </div>

          <div className="space-y-3">
            {topNgos.map((ngo, idx) => (
              <div key={ngo._id || idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition-all border border-stone-100">
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                      {ngo.orgName}
                      {ngo.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </h4>
                    <span className="text-[10px] text-stone-400 line-clamp-1 max-w-[150px]">{ngo.servesDescription}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-900">{ngo.totalKgClaimed || 200} kg</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">⭐ {ngo.avgRating || 5.0} Trust Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}