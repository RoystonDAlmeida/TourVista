import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from './icons';
import Auth from './Auth';
import type { AppUser } from '../types';

interface HeaderProps {
  user: AppUser | null;
  onSignInClick: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ user, onSignInClick, children }) => {
  return (
    <header className="w-full max-w-5xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-4 sm:mb-0">
          <LogoIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
            TourVista
          </h1>
        </Link>
        <div className="flex justify-end"> {/* This div will contain Auth component */}
          <Auth user={user} onSignInClick={onSignInClick} />
        </div>
      </div>
      
      {children && (
        <div className="mt-6 flex justify-center">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;
