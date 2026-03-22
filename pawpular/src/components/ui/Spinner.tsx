import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Ring = styled.div`
  width: ${({ theme }) => theme.controls.large};
  height: ${({ theme }) => theme.controls.large};
  border: ${({ theme }) => theme.borders.heavy} solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.circle};
  animation: ${spin} 0.8s linear infinite;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

// Spinning loading indicator
export function Spinner() {
  return (
    <Wrapper role="status" aria-label="Loading">
      <Ring />
    </Wrapper>
  );
}
