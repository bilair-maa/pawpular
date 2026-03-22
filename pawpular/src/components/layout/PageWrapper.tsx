import styled from 'styled-components';
import { Navbar } from './Navbar';

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundGradient};

  > main {
    width: min(1240px, calc(100% - clamp(32px, 8vw, 96px)));
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 720px) {
      width: min(100% - 24px, 100%);
    }
  }
`;

// Wraps every page with the navbar and the gradient background
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Navbar />
      {children}
    </Shell>
  );
}
