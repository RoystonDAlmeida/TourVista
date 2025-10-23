import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { XIcon } from '../icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const onSignUpClick = () => navigate('/signup');
    const onSignInClick = () => navigate('/signin');
    const onForgotPasswordClick = () => navigate('/forgot-password');

    const renderContent = () => {
        switch (location.pathname) {
            case '/signin':
                return <SignInForm onSignUpClick={onSignUpClick} onForgotPasswordClick={onForgotPasswordClick} onAuthenticated={onClose} />;
            case '/signup':
                return <SignUpForm onSignInClick={onSignInClick} onAuthenticated={onClose} />;
            case '/forgot-password':
                return <ForgotPasswordForm onSignInClick={onSignInClick} />;
            case '/reset-password':
                return <ResetPasswordForm />;
            default:
                return null;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative bg-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-700"
                onClick={e => e.stopPropagation()} // Prevent closing modal on inner click
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
                    aria-label="Close authentication form"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default AuthModal;