import toast from 'react-hot-toast';

export interface FirebaseError {
  code: string;
  message: string;
}

export const handleAuthError = (error: any): void => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'An unexpected error occurred';

  switch (errorCode) {
    case 'auth/invalid-credential':
      toast.error('Invalid credentials. Please check your email and password.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/user-not-found':
      toast.error('No account found with this email. Please sign up first.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/wrong-password':
      toast.error('Incorrect password. Please try again.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/email-already-in-use':
      toast.error('This email is already registered. Please sign in instead.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/weak-password':
      toast.error('Password is too weak. Please choose a stronger password.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/invalid-email':
      toast.error('Please enter a valid email address.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/too-many-requests':
      toast.error('Too many failed attempts. Please try again later.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    case 'auth/network-request-failed':
      toast.error('Network error. Please check your internet connection.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;

    default:
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fca5a5',
          border: '1px solid #dc2626',
        },
      });
      break;
  }
};

export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    duration: 3000,
    style: {
      background: '#1f2937',
      color: '#86efac',
      border: '1px solid #16a34a',
    },
  });
};
