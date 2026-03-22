import { Component, type ReactNode, type ErrorInfo } from 'react';
import styled from 'styled-components';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Heading = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(22px, 3vw, 30px);
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.base};
  max-width: 480px;
`;

const RetryBtn = styled.button`
  height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }
`;

interface Props { children: ReactNode; }
interface State { error: Error | null; }

// Catches crashes inside any child component and shows a recovery screen instead
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Page role="alert">
          <Heading>Something went wrong</Heading>
          <Message>{this.state.error.message || 'An unexpected error occurred.'}</Message>
          <RetryBtn onClick={() => this.setState({ error: null })}>
            Try again
          </RetryBtn>
        </Page>
      );
    }
    return this.props.children;
  }
}
