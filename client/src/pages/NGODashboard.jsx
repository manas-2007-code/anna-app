import React, { useState } from 'react';
import { Flame, ShieldAlert, ShieldCheck, MapPin, Clock } from 'lucide-react';
import RadarMap from '../components/RadarMap';
import RiderLiveTracker from '../components/RiderLiveTracker';

export default function NGODashboard({ user, listings, onClaimListing, activeClaims, onCompleteClaim, onToggleAdminVerify }) {
  const [filterType, setFilterType] = useState('all');

  const filteredListings = listings.filter((l) => {
    if (l.status !== 'listed') return false;
    if (filterType === 'all') return true;
    return l.foodType === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {!user.isVerified ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Account Verification Pending Approval</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                To safeguard recipients, NGO registration documents must be verified before claiming surplus food.
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggleAdminVerify(user._id)}
            className="px-4 py-2 bg-stone-900 text-amber-300 hover:bg-stone-800 text-xs font-bold rounded-xl whitespace-nowrap shadow"
          >
            ⚡ Quick-Approve (Demo Mode)
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Verified NGO Partner — Full live claim access enabled.</span>
          </div>
          <span className="text-[11px] font-bold bg-white text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
            {user.servesDescription}
          </span>
        </div>
      )}

      {activeClaims.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            Your Active Volunteer Dispatch
          </h3>
          <RiderLiveTracker
            claim={activeClaims[0]}
            onCompletePickup={onCompleteClaim}
            role="ngo"
          />
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="font-serif-title text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-ann-brand" />
            Live Urgency Radar Map
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Real-time matching ranked by distance and expiry deadlines</p>
        </div>

        <RadarMap
          listings={listings}
          onClaimListing={onClaimListing}
          ngoUser={user}
        />
      </section>

      <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900">Nearby Surplus Food Feed</h3>
            <p className="text-xs text-stone-500">Sorted by dynamic priority algorithm</p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'veg', 'non-veg', 'bakery', 'mixed'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filterType === type ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => {
            const hoursLeft = Math.max(0.1, (new Date(item.expiresAt) - Date.now()) / (1000 * 60 * 60));
            const isUrgent = hoursLeft < 1.0;

            return (
              <div
                key={item._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-lg ${
                  isUrgent ? 'border-red-300 bg-red-50/20' : 'border-stone-200 bg-white'
                }`}
              >
                <div>
                  <div className="relative mb-3">
                    <img src={item.photoUrl} alt={item.foodName} className="w-full h-40 object-cover rounded-xl" />
                    {isUrgent && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md animate-pulse">
                        🔥 Critical (&lt;1h)
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Score: {item.priorityScore || '0.95'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="font-bold text-stone-800">{item.donorId?.brandName || 'Verified Donor'}</span>
                    <span>⭐ {item.donorId?.avgRating || '5.0'}</span>
                  </div>

                  <h4 className="font-bold text-base text-stone-900 leading-tight mb-2">{item.foodName}</h4>

                  <div className="space-y-1 text-xs text-stone-600 mb-4">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.pickupAddress}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Expires in <strong>{hoursLeft < 1 ? `${Math.round(hoursLeft * 60)} mins` : `${hoursLeft.toFixed(1)} hrs`}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Quantity</p>
                    <p className="text-sm font-extrabold text-stone-900">{item.quantity} {item.quantityUnit}</p>
                  </div>

                  <button
                    onClick={() => onClaimListing(item._id)}
                    disabled={!user.isVerified}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      user.isVerified
                        ? 'bg-ann-brand hover:bg-ann-brandHover text-white shadow-md shadow-ann-brand/20'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {user.isVerified ? 'Claim & Dispatch' : 'Approval Needed'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}