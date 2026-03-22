import styled from 'styled-components';
import { SkeletonCard } from '../gallery/SkeletonCard';

const Page = styled.div`
  max-width: ${({ theme }) => theme.layout.full};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 36px) clamp(16px, 4vw, 40px) 80px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
`;

// Skeleton grid shown while a page is still loading
export function RouteFallback() {
  return (
    <Page aria-busy="true" aria-label="Loading page content">
      <Grid>
        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
      </Grid>
    </Page>
  );
}
