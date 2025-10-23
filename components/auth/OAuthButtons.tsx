import React from 'react';
import { signInWithGoogle } from '../../services/firebaseService';
import { GoogleIcon } from '../icons';

interface OAuthButtonsProps {
    onAuthenticated: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onAuthenticated }) => {
    
    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            onAuthenticated();
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            // Optionally, display an error message to the user
        }
    };

    return (
        <div className="flex justify-center">
            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors shadow"
            >
                <GoogleIcon className="w-5 h-5" />
                Google
            </button>
        </div>
    );
};

export default OAuthButtons;