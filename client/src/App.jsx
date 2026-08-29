import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import NewListingForm from './pages/NewListingForm';
import ImpactLeaderboard from './pages/ImpactLeaderboard';
import RatingModal from './components/RatingModal';

const socket = io('http://localhost:5000');

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('ngo');
  const [token, setToken] = useState(localStorage.getItem('ann_token') || '');
  const [activeTab, setActiveTab] = useState('landing');
  const [listings, setListings] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, targetUser: null, listingId: null });

  const fetchFeed = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/listings/nearby');
      const data = await res.json();
      if (Array.isArray(data)) setListings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeed();
    handleDemoLogin('rha@delhi.org', 'password123', 'ngo');

    socket.on('new_urgent_listing', (newListing) => {
      setListings((prev) => [newListing, ...prev]);
    });

    socket.on('listing_claimed', ({ listingId, claim }) => {
      setListings((prev) => prev.map(l => l._id === listingId ? { ...l, status: 'claimed' } : l));
      setActiveClaims((prev) => [claim, ...prev]);
    });

    socket.on('listing_reopened', (reopened) => {
      setListings((prev) => prev.map(l => l._id === reopened._id ? reopened : l));
    });

    return () => {
      socket.off('new_urgent_listing');
      socket.off('listing_claimed');
      socket.off('listing_reopened');
    };
  }, []);

  const handleDemoLogin = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        setUser(data.user);
        setRole(data.role);
        setToken(data.token);
        localStorage.setItem('ann_token', data.token);
        setActiveTab(data.role === 'donor' ? 'donor-dash' : 'radar');
      }
    } catch (err) {
      console.error('Login error', err);
    }
  };

  const handleCreateListing = async (formData) => {
    const res = await fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    fetchFeed();
    setActiveTab('donor-dash');
  };

  const handleClaimListing = async (listingId) => {
    if (!token) return alert('Please sign in to claim food');
    const res = await fetch('http://localhost:5000/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ listingId })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }
    setActiveClaims([data, ...activeClaims]);
    fetchFeed();
  };

  const handleCompleteClaim = async (claimId) => {
    await fetch(`http://localhost:5000/api/claims/${claimId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setActiveClaims([]);
    fetchFeed();
    setRatingModal({ isOpen: true, targetUser: user, listingId: claimId });
  };

  const handleNoShow = async (claimId) => {
    await fetch(`http://localhost:5000/api/claims/${claimId}/no-show`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setActiveClaims([]);
    fetchFeed();
    alert('Listing auto-reopened on Radar.');
  };

  const handleToggleAdminVerify = async (ngoId) => {
    const res = await fetch(`http://localhost:5000/api/auth/ngo/${ngoId}/verify`, { method: 'PATCH' });
    const updated = await res.json();
    setUser(updated);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar
        user={user}
        role={role}
        onLogout={() => { setUser(null); setActiveTab('landing'); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="bg-stone-900 text-amber-200 text-xs px-4 py-2 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Judge Demo Switcher:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDemoLogin('haldirams@cp.com', 'password123')}
            className="hover:underline text-white font-bold"
          >
            [Donor: Haldirams]
          </button>
          <span>|</span>
          <button
            onClick={() => handleDemoLogin('rha@delhi.org', 'password123')}
            className="hover:underline text-white font-bold"
          >
            [Verified NGO: Robin Hood Army]
          </button>
          <span>|</span>
          <button
            onClick={() => handleDemoLogin('pending@ngo.org', 'password123')}
            className="hover:underline text-amber-400 font-bold"
          >
            [Unverified NGO: Test Gatekeeping]
          </button>
        </div>
      </div>

      <main className="flex-grow">
        {activeTab === 'landing' && (
          <LandingPage
            onSelectRole={(r) => {
              if (r === 'donor') handleDemoLogin('haldirams@cp.com', 'password123');
              else handleDemoLogin('rha@delhi.org', 'password123');
            }}
          />
        )}

        {activeTab === 'donor-dash' && user && (
          <DonorDashboard
            user={user}
            listings={listings}
            activeClaims={activeClaims}
            onCompleteClaim={handleCompleteClaim}
            onNoShowClaim={handleNoShow}
            onNavigateNewListing={() => setActiveTab('new-listing')}
          />
        )}

        {activeTab === 'radar' && user && (
          <NGODashboard
            user={user}
            listings={listings}
            onClaimListing={handleClaimListing}
            activeClaims={activeClaims}
            onCompleteClaim={handleCompleteClaim}
            onToggleAdminVerify={handleToggleAdminVerify}
          />
        )}

        {activeTab === 'new-listing' && (
          <NewListingForm
            onSubmit={handleCreateListing}
            onBack={() => setActiveTab('donor-dash')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <ImpactLeaderboard />
        )}
      </main>

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, targetUser: null, listingId: null })}
        targetUser={ratingModal.targetUser}
        listingId={ratingModal.listingId}
        onSubmitRating={(data) => {
          fetch('http://localhost:5000/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
          });
        }}
      />

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <p>© Ann (अन्न) Surplus Food Priority Network • Food Safety & Real-Time Logistics Infrastructure</p>
      </footer>
    </div>
  );
}