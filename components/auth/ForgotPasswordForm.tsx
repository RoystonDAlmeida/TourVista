import React, { useState } from 'react';
import { sendPasswordResetEmail } from '../../services/firebaseService';
import { showSuccessToast } from '../../utils/authErrorHandler';
import { MailIcon } from '../icons';

interface ForgotPasswordFormProps {
    onSignInClick: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSignInClick }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await sendPasswordResetEmail(email);
            showSuccessToast('Password reset email sent! Please check your inbox.');
            onSignInClick(); // Redirect to sign-in after sending email
        } catch (err: any) {
            if (err.message === 'auth/user-not-found') {
                setError('This email is not registered. Please sign up.');
            } else {
                setError('Failed to send password reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
                <p className="text-slate-400 mt-1">Enter your email to receive a password reset link.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition disabled:bg-slate-600">
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
            </form>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <p className="text-center text-sm text-slate-400">
                Remember your password?{' '}
                <button onClick={onSignInClick} className="font-semibold text-cyan-400 hover:underline">
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default ForgotPasswordForm;