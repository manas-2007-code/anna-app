import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

const createUrgencyIcon = (hoursToExpiry) => {
  let bgColor = '#16A34A';
  let pulseClass = '';

  if (hoursToExpiry < 1.0) {
    bgColor = '#DC2626';
    pulseClass = 'marker-urgent-pulse';
  } else if (hoursToExpiry < 4.0) {
    bgColor = '#EA580C';
  }

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs ${pulseClass}" style="background-color: ${bgColor};">
          🍲
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export default function RadarMap({ listings, onClaimListing, ngoUser }) {
  const [selectedRadius, setSelectedRadius] = useState(5000);
  const centerLat = ngoUser?.liveLocation?.lat || 28.6139;
  const centerLng = ngoUser?.liveLocation?.lng || 77.2090;

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-xl border border-stone-200">
      
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-md border border-stone-200 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-stone-800">Live Radar</span>
        </div>
        <select
          value={selectedRadius}
          onChange={(e) => setSelectedRadius(Number(e.target.value))}
          className="text-xs font-semibold bg-stone-100 border-none rounded-lg px-2 py-1 text-stone-700 outline-none cursor-pointer"
        >
          <option value={3000}>3 km radius</option>
          <option value={5000}>5 km radius</option>
          <option value={10000}>10 km radius</option>
          <option value={20000}>20 km radius</option>
        </select>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-stone-200 flex items-center gap-3 text-[11px] font-semibold text-stone-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-ann-urgent inline-block"></span>
          <span>&lt; 1hr (Critical)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-ann-moderate inline-block"></span>
          <span>&lt; 4hrs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-ann-safe inline-block"></span>
          <span>Plenty of time</span>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Circle
          center={[centerLat, centerLng]}
          radius={selectedRadius}
          pathOptions={{
            color: '#D9531E',
            fillColor: '#D9531E',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 8'
          }}
        />

        {listings.map((item) => {
          const hoursLeft = Math.max(0.1, (new Date(item.expiresAt) - Date.now()) / (1000 * 60 * 60));
          return (
            <Marker
              key={item._id}
              position={[item.pickupLat, item.pickupLng]}
              icon={createUrgencyIcon(hoursLeft)}
            >
              <Popup>
                <div className="p-1 max-w-[240px]">
                  <img
                    src={item.photoUrl}
                    alt={item.foodName}
                    className="w-full h-24 object-cover rounded-xl mb-2"
                  />
                  <h4 className="font-bold text-sm text-stone-900 leading-tight mb-1">{item.foodName}</h4>
                  <p className="text-xs text-stone-600 mb-1">
                    📍 {item.pickupAddress}
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 py-1.5 border-t border-stone-100 my-1">
                    <span>{item.quantity} {item.quantityUnit}</span>
                    <span className={`font-bold ${hoursLeft < 1 ? 'text-red-600' : 'text-stone-600'}`}>
                      ⏳ {hoursLeft < 1 ? `${Math.round(hoursLeft * 60)}m left` : `${hoursLeft.toFixed(1)}h left`}
                    </span>
                  </div>

                  {item.status === 'listed' ? (
                    <button
                      onClick={() => onClaimListing(item._id)}
                      className="w-full mt-1.5 py-1.5 bg-ann-brand hover:bg-ann-brandHover text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      ⚡ Claim For Pickup
                    </button>
                  ) : (
                    <div className="w-full text-center py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold">
                      Claimed / In-Transit
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}