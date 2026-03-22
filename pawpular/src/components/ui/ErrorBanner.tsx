import styled from 'styled-components';

const Banner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const RetryButton = styled.button`
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.error};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 900;

  transition: filter 0.2s ease;
  &:hover { filter: brightness(0.95); }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.error};
    outline-offset: 3px;
  }
`;

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

// Red alert box shown when something fails, with an optional retry button
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Banner role="alert">
      <span>{message}</span>
      {onRetry && (
        <RetryButton type="button" onClick={onRetry}>
          Retry
        </RetryButton>
      )}
    </Banner>
  );
}
