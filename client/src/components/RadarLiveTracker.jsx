import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bike, CheckCircle2, Clock, MapPin } from 'lucide-react';

const bikeIcon = L.divIcon({
  className: 'rider-pin',
  html: `
    <div class="w-10 h-10 rounded-full bg-stone-900 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-white animate-bounce">
      🛵
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const storeIcon = L.divIcon({
  className: 'store-pin',
  html: `<div class="w-8 h-8 rounded-full bg-ann-brand border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">🏪</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function RiderLiveTracker({ claim, onCompletePickup, onMarkNoShow, role }) {
  const [eta, setEta] = useState(claim.estimatedArrivalMinutes || 12);
  const [riderCoords, setRiderCoords] = useState([
    claim.riderLocation?.lat || 28.6139,
    claim.riderLocation?.lng || 77.2090
  ]);

  const donorCoords = [
    claim.listingId?.pickupLat || 28.6328,
    claim.listingId?.pickupLng || 77.2197
  ];

  useEffect(() => {
    if (claim.status !== 'en_route') return;

    const interval = setInterval(() => {
      setRiderCoords((prev) => {
        const nextLat = prev[0] + (donorCoords[0] - prev[0]) * 0.15;
        const nextLng = prev[1] + (donorCoords[1] - prev[1]) * 0.15;
        return [nextLat, nextLng];
      });

      setEta((prev) => Math.max(1, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [claim.status]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-ann-brand">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                Live Swiggy-Style Tracking
              </span>
              <span className="text-xs text-stone-500 font-medium">Claim #{claim._id?.slice(-6)}</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900">{claim.listingId?.foodName}</h3>
          </div>
        </div>

        <div className="bg-stone-900 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-semibold">Estimated Arrival</p>
            <p className="text-base font-extrabold">{eta} mins away</p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full rounded-2xl overflow-hidden my-6 border border-stone-200 relative">
        <MapContainer center={donorCoords} zoom={13} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={donorCoords} icon={storeIcon}>
            <Popup>Donor Pickup Location</Popup>
          </Marker>
          <Marker position={riderCoords} icon={bikeIcon}>
            <Popup>Volunteer / Rider En Route</Popup>
          </Marker>
          <Polyline positions={[riderCoords, donorCoords]} color="#D9531E" weight={4} dashArray="6, 8" />
        </MapContainer>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <MapPin className="w-4 h-4 text-stone-400" />
          <span>Pickup Address: <strong>{claim.listingId?.pickupAddress}</strong></span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {role === 'donor' && (
            <button
              onClick={() => onMarkNoShow(claim._id)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all"
            >
              Report No-Show & Reopen
            </button>
          )}

          <button
            onClick={() => onCompletePickup(claim._id)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Handover & Complete
          </button>
        </div>
      </div>
    </div>
  );
}