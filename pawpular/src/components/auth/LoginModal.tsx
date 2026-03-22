import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLoginModal } from '../../context/LoginModalContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { LoginPanel } from './LoginPanel';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 150;
  background: ${({ theme }) => theme.colors.scrim};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.3s ease;
`;

const PanelWrap = styled.div`
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: ${({ theme }) => theme.controls.base};
  height: ${({ theme }) => theme.controls.base};
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.circle};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 900;
  line-height: 1;
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }
`;

// Full-screen overlay with the sign-in form; closes on Escape or clicking the backdrop
export function LoginModal() {
  const { open, initialMode, closeLogin } = useLoginModal();
  const containerRef = useFocusTrap<HTMLDivElement>(open); // Keeps Tab focus inside the modal while it's open

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLogin();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeLogin]);

  if (!open) return null;

  return (
    <Scrim
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeLogin(); }}
    >
      <PanelWrap>
        <CloseButton type="button" aria-label="Close sign in" onClick={closeLogin}>×</CloseButton>
        <LoginPanel onSuccess={closeLogin} initialMode={initialMode} />
      </PanelWrap>
    </Scrim>
  );
}
