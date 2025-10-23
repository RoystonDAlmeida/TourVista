
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/firebaseService';
import { handleAuthError, showSuccessToast } from '../../utils/authErrorHandler';
import { LockClosedIcon } from '../icons';

const ResetPasswordForm: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [oobCode, setOobCode] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('oobCode');
        if (code) {
            setOobCode(code);
        } else {
            setError("Invalid password reset link. Please try again.");
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!oobCode) {
            setError("Missing password reset code. Please use the link from your email.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await resetPassword(oobCode, password);
            showSuccessToast('Password has been reset successfully! You can now sign in.');
            navigate('/signin');
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100">Reset Your Password</h2>
                <p className="text-slate-400 mt-1">Enter your new password below.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="New Password"
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
                        placeholder="Confirm New Password"
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                </div>
                <button type="submit" disabled={isLoading || !oobCode} className="w-full py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition disabled:bg-slate-600">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
    );
};

export default ResetPasswordForm;
