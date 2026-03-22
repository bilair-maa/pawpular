import styled from 'styled-components';

const Card = styled.article`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Line = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? '14px'};
  width: ${({ $width }) => $width ?? '100%'};
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const TagLine = styled.div`
  width: 52px;
  height: 18px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

// Placeholder card shown while the real pet images are loading
export function SkeletonCard() {
  return (
    <Card aria-hidden="true">
      <ImagePlaceholder />
      <Body>
        <TitleRow>
          <Line $width="60%" />
          <TagLine />
        </TitleRow>
        <Line $width="90%" $height="12px" />
        <Line $width="70%" $height="12px" />
      </Body>
    </Card>
  );
}
