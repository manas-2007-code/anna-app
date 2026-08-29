import React, { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import RiderLiveTracker from '../components/RiderLiveTracker';

export default function DonorDashboard({ user, listings, activeClaims, onCompleteClaim, onNoShowClaim, onNavigateNewListing }) {
  const [activeTrackingClaim] = useState(activeClaims[0] || null);
  const myListings = listings.filter(l => l.donorId?._id === user._id || l.donorId === user._id);
  const totalMeals = Math.round((user.totalKgDonated || 85) * 2.8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">{user.brandName}</h2>
            {user.fssaiVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Verified
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Registered as {user.donorType} • Rating: <strong>⭐ {user.avgRating || 5.0}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-2xl text-center flex-1 md:flex-none">
            <p className="text-[10px] uppercase font-bold text-stone-500">Meals Saved</p>
            <p className="text-2xl font-extrabold text-stone-900">{totalMeals}</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-2xl text-center flex-1 md:flex-none">
            <p className="text-[10px] uppercase font-bold text-stone-500">Total Weight</p>
            <p className="text-2xl font-extrabold text-ann-brand">{user.totalKgDonated || 85} kg</p>
          </div>
          <button
            onClick={onNavigateNewListing}
            className="flex items-center justify-center gap-2 bg-ann-brand hover:bg-ann-brandHover text-white px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-ann-brand/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Donation</span>
          </button>
        </div>
      </div>

      {activeClaims.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            Live Pickup In Progress
          </h3>
          <RiderLiveTracker
            claim={activeTrackingClaim || activeClaims[0]}
            onCompletePickup={onCompleteClaim}
            onMarkNoShow={onNoShowClaim}
            role="donor"
          />
        </section>
      )}

      <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <h3 className="font-serif-title text-lg font-bold text-stone-900 mb-4">Your Surplus Listings ({myListings.length})</h3>

        {myListings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
            <p className="text-sm font-semibold text-stone-600">No food listings posted yet.</p>
            <p className="text-xs text-stone-400 mt-1">Have leftover meals or surplus catering? Post it in 30 seconds.</p>
            <button
              onClick={onNavigateNewListing}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
            >
              Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map((item) => (
              <div key={item._id} className="border border-stone-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all bg-stone-50/50">
                <div>
                  <img src={item.photoUrl} alt={item.foodName} className="w-full h-36 object-cover rounded-xl mb-3" />
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      {item.foodType}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'listed' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      ● {item.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 mt-2 line-clamp-1">{item.foodName}</h4>
                  <p className="text-xs text-stone-500 mt-1">Qty: <strong>{item.quantity} {item.quantityUnit}</strong> ({item.condition})</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                  <span>Expires: {new Date(item.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {item.claimedByNgoId && (
                    <span className="text-emerald-700 font-bold">Claimed by {item.claimedByNgoId?.orgName || 'NGO'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}