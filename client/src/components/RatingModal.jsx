import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';

export default function RatingModal({ isOpen, onClose, targetUser, listingId, onSubmitRating }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRating({ stars, comment, listingId });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in duration-200">
        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Feedback Submitted!</h3>
            <p className="text-xs text-stone-500 mt-1">Thank you for strengthening community trust.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-6">
              <span className="text-2xl">🤝</span>
              <h3 className="text-xl font-bold text-stone-900 font-serif-title mt-2">Mutual Quality Rating</h3>
              <p className="text-xs text-stone-500 mt-1">
                How was your food handover experience with <strong className="text-stone-800">{targetUser?.brandName || targetUser?.orgName || 'Partner'}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setStars(num)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      num <= stars ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Comments & Food Condition Note</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Packaged properly, timely pickup, respectful volunteer..."
                className="w-full rounded-2xl border border-stone-200 p-3 text-xs focus:ring-2 focus:ring-ann-brand focus:border-transparent outline-none resize-none h-24"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50"
              >
                Skip
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-ann-brand hover:bg-ann-brandHover text-white text-xs font-bold shadow-md shadow-ann-brand/20 transition-all"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}