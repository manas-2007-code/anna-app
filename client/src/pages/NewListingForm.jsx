import React, { useState } from 'react';
import { Camera, MapPin, ArrowLeft } from 'lucide-react';

export default function NewListingForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: 'veg',
    quantity: '25',
    quantityUnit: 'servings',
    condition: 'cooked-today',
    hoursValid: '3',
    pickupAddress: 'Connaught Place Block A, New Delhi',
    pickupLat: 28.6328,
    pickupLng: 77.2197,
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName || !formData.quantity || !formData.pickupAddress) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to publish listing');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <span className="text-[11px] font-extrabold uppercase text-ann-brand tracking-wider">Fast Donation Dispatch</span>
          <h2 className="font-serif-title text-2xl font-bold text-stone-900 mt-1">Post Surplus Food</h2>
          <p className="text-xs text-stone-500 mt-1">
            Food will immediately appear on the live radar for nearby verified NGOs.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Food Title & Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. 5 Large Trays Veg Pulao & Paneer Butter Masala"
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Food Category</label>
              <select
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand outline-none"
              >
                <option value="veg">Vegetarian (Cooked)</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="bakery">Bakery / Bread</option>
                <option value="packaged">Packaged / Dry</option>
                <option value="mixed">Mixed Leftovers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Food Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand outline-none"
              >
                <option value="cooked-today">Cooked Today (Fresh)</option>
                <option value="fresh">Uncooked / Sealed Fresh</option>
                <option value="near-expiry">Near Expiry (Consume Today)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Quantity & Unit *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-1/2 rounded-xl border border-stone-200 p-3 text-xs outline-none focus:ring-2 focus:ring-ann-brand"
                />
                <select
                  value={formData.quantityUnit}
                  onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                  className="w-1/2 rounded-xl border border-stone-200 p-3 text-xs outline-none focus:ring-2 focus:ring-ann-brand"
                >
                  <option value="servings">Servings</option>
                  <option value="kg">kg</option>
                  <option value="packets">Packets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Hours Safe for Consumption *</label>
              <select
                value={formData.hoursValid}
                onChange={(e) => setFormData({ ...formData, hoursValid: e.target.value })}
                className="w-full rounded-xl border border-stone-200 p-3 text-xs outline-none focus:ring-2 focus:ring-ann-brand"
              >
                <option value="1">1 Hour (Immediate Pickup)</option>
                <option value="2">2 Hours</option>
                <option value="4">4 Hours</option>
                <option value="8">8 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Pickup Location Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
              <input
                type="text"
                required
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                className="w-full pl-9 rounded-xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Food Photo URL</label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full pl-9 rounded-xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-ann-brand hover:bg-ann-brandHover text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-ann-brand/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing to Radar...' : '⚡ Broadcast Live Food Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}