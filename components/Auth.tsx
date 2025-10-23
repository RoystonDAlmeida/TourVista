import React from 'react';
import { signOutUser } from '../services/firebaseService';
import type { AppUser } from '../types';
import { UserIcon } from './icons';

interface AuthProps {
    user: AppUser | null;
    onSignInClick: () => void;
}

const Auth: React.FC<AuthProps> = ({ user, onSignInClick }) => {
    if (user) {
        return (
            <div className="flex items-center gap-3">
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
                <button 
                    onClick={signOutUser} 
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 transition-colors rounded-md text-sm font-semibold"
                >
                    Sign Out
                </button>
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