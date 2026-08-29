import React from 'react';
import { HeartHandshake, ShieldCheck, Award, LogOut, Flame } from 'lucide-react';

export default function Navbar({ user, role, onLogout, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-stone-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div 
          onClick={() => setActiveTab(role === 'donor' ? 'donor-dash' : 'radar')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-ann-brand flex items-center justify-center text-white shadow-md shadow-ann-brand/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title text-2xl font-bold tracking-tight text-stone-900">Ann</span>
              <span className="text-xs bg-stone-900 text-amber-200 px-1.5 py-0.5 rounded font-mono font-semibold">अन्न</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Real-Time Surplus Matcher</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user && role === 'ngo' && (
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'radar' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              <Flame className="w-4 h-4 text-ann-brand" />
              Live Radar
            </button>
          )}

          {user && role === 'donor' && (
            <>
              <button
                onClick={() => setActiveTab('donor-dash')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'donor-dash' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                My Food Listings
              </button>
              <button
                onClick={() => setActiveTab('new-listing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-ann-brand text-white hover:bg-ann-brandHover shadow-sm shadow-ann-brand/30 transition-all"
              >
                + Donate Food
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'leaderboard' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            Impact
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-300">
              <div className="hidden md:block text-right">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-stone-900 max-w-[130px] truncate">
                    {user.brandName || user.orgName}
                  </span>
                  {(user.fssaiVerified || user.isVerified) && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Account" />
                  )}
                </div>
                <p className="text-[10px] text-stone-500 font-medium capitalize">{role}</p>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('landing')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}