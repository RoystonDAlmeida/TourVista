import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOutUser } from '../services/firebaseService';
import type { AppUser } from '../types';
import { UserIcon, BookmarkSquareIcon, CalendarDaysIcon } from './icons';

interface AuthProps {
    user: AppUser | null;
    onSignInClick: () => void;
}

const Auth: React.FC<AuthProps> = ({ user, onSignInClick }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = () => {
        signOutUser();
        setShowDropdown(false);
    };

    if (user) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button 
                    className="flex items-center gap-3 focus:outline-none" 
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm leading-tight text-slate-200">{user.displayName}</p>
                        <p className="text-xs text-slate-400 leading-tight">{user.email}</p>
                    </div>
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border-2 border-slate-600" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-600 p-1 flex items-center justify-center border-2 border-slate-600">
                            <UserIcon className="w-8 h-8 text-slate-400" />
                        </div>
                    )}
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-20">
                        <Link 
                            to="/discoveries" 
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                            onClick={() => setShowDropdown(false)}
                        >
                            <BookmarkSquareIcon className="w-5 h-5" />
                            My Discoveries
                        </Link>
                        <Link 
                            to="/itineraries" 
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                            onClick={() => setShowDropdown(false)}
                        >
                            <CalendarDaysIcon className="w-5 h-5" />
                            My Itineraries
                        </Link>
                        <button 
                            onClick={handleSignOut} 
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <button 
            onClick={onSignInClick} 
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors shadow-md"
        >
            Sign In / Sign Up
        </button>
    );
};

export default Auth;