import React, { useState } from 'react';
import { signUpWithEmail } from '../../services/firebaseService';
import { handleAuthError, showSuccessToast } from '../../utils/authErrorHandler';
import OAuthButtons from './OAuthButtons';
import { MailIcon, LockClosedIcon, UserIcon } from '../icons';

interface SignUpFormProps {
    onSignInClick: () => void;
    onAuthenticated: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignInClick, onAuthenticated }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await signUpWithEmail(email, password, displayName);
            showSuccessToast('Account created! Please check your email to verify your account.');
            onSignInClick();
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
                <p className="text-slate-400 mt-1">Join TourVista to save your adventures.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Display Name"
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                </div>
                <div className="relative">
                    <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                </div>
                 <div className="relative">
                    <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                </div>
                <div className="relative">
                    <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition disabled:bg-slate-600">
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            { error && <p className="text-red-400 text-sm text-center">{error}</p> }
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-slate-800 px-2 text-slate-400">Or sign up with</span>
                </div>
            </div>

            <OAuthButtons onAuthenticated={onAuthenticated} />
            
            <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <button onClick={onSignInClick} className="font-semibold text-cyan-400 hover:underline">
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default SignUpForm;