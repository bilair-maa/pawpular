import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/useUser';
import { useLoginModal } from '../../context/LoginModalContext';

// Redirects to home and opens the sign-in modal if the user isn't logged in
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();

  useEffect(() => {
    if (!isAuthenticated) openLogin('register');
  }, [isAuthenticated, openLogin]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
