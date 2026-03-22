import { createContext, useCallback, useContext, useState } from 'react';

// Controls which tab the login modal opens on
export type LoginMode = 'login' | 'register';

interface LoginModalContextValue {
  open: boolean;
  initialMode: LoginMode;
  openLogin: (mode?: LoginMode) => void;
  closeLogin: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<LoginMode>('login');

  // Opens the modal; pass 'register' to start on the sign-up tab
  const openLogin = useCallback((mode: LoginMode = 'login') => {
    setInitialMode(mode);
    setOpen(true);
  }, []);

  return (
    <LoginModalContext.Provider value={{ open, initialMode, openLogin, closeLogin: () => setOpen(false) }}>
      {children}
    </LoginModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error('useLoginModal must be used within LoginModalProvider');
  return ctx;
}
