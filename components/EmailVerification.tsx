import React, { useState } from 'react';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { showSuccessToast, handleAuthError } from '../utils/authErrorHandler';

const EmailVerification: React.FC = () => {
    const [isSending, setIsSending] = useState(false);
    const auth = getAuth();
    const user = auth.currentUser;

    const handleResendVerification = async () => {
        if (!user) return;
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            showSuccessToast('A new verification email has been sent. Please check your inbox.');
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
            <p className="text-slate-300 mb-6">A verification link has been sent to your email address. Please click the link to activate your account.</p>
            <p className="text-slate-400 text-sm mb-6">If you haven't received the email, please check your spam folder or click the button below to resend it.</p>
            <button 
                onClick={handleResendVerification}
                disabled={isSending}
                className="w-full py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition disabled:bg-slate-600"
            >
                {isSending ? 'Sending...' : 'Resend Verification Email'}
            </button>
        </div>
    );
};

export default EmailVerification;