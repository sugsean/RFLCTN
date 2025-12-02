
import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { Icons } from '../constants';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isAdmin, setIsAdmin, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gufram-style Navigation Mapping
  const navItems = [
    { label: 'PRODUCTS', view: AppView.BLOG_FEED },
    { label: 'STORIES', view: AppView.LONG_READS }, // New Long Form Tab
    { label: 'HISTORY', view: AppView.SAVED_LOOKS },
    { label: 'THE SUBJECT', view: AppView.PROFILE },
    { label: 'NEWS', view: AppView.NEWSROOM },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-8">
        {/* Brand */}
        <div 
          onClick={() => setView(AppView.BLOG_FEED)}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-none cursor-pointer select-none"
        >
          RFLCTN
        </div>

        {/* Links */}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <button 
                onClick={() => {
                  setView(item.view);
                  setIsMenuOpen(false);
                }}
                className={`
                  text-2xl md:text-3xl font-black tracking-tight uppercase hover:underline decoration-4 underline-offset-4
                  ${currentView === item.view ? 'underline' : ''}
                `}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Newsletter */}
      <div className="mt-12 space-y-6">
        <div className="space-y-2">
          <h3 className="font-bold uppercase text-sm tracking-widest">Newsletter</h3>
          <div className="flex border-b-2 border-black">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="w-full py-2 bg-transparent outline-none font-bold uppercase placeholder:text-stone-400"
            />
            <button className="font-black uppercase px-2 hover:bg-black hover:text-white transition-colors">Send</button>
          </div>
          <div className="text-[10px] font-medium leading-tight uppercase text-stone-500 text-justify">
            GUFRAM SRL Località Batasiolo 85/A, 12064, La Morra (CN) P.IVA: 05982260019
            <br/><br/>
            I consent to my Data being processed for profiling activities, to receive commercial and marketing information via email, even by automated means that take into account my preferences, interests, characteristics and consumption habits.
          </div>
        </div>

        {/* Admin Toggle Hidden in Plain Sight */}
        <button 
          onClick={() => setIsAdmin(!isAdmin)} 
          className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isAdmin ? 'text-red-600' : 'text-stone-300 hover:text-stone-500'}`}
        >
          {isAdmin ? 'ADMIN UNLOCKED' : 'ADMIN LOCKED'} {isAdmin ? <Icons.Unlock /> : <Icons.Lock />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:block fixed top-0 left-0 bottom-0 w-96 bg-white z-40 p-8 border-r-4 border-black overflow-y-auto no-scrollbar">
        <NavContent />
      </nav>

      {/* Mobile Header */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black px-4 h-16 flex items-center justify-between">
        <div 
          onClick={() => setView(AppView.BLOG_FEED)}
          className="text-3xl font-black tracking-tighter leading-none"
        >
          RFLCTN
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="font-black uppercase tracking-widest border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          {isMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-4 pb-8 flex flex-col overflow-y-auto">
          <NavContent />
        </div>
      )}
    </>
  );
};
