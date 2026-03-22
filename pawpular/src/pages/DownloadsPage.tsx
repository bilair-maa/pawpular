import { useEffect } from 'react';
import styled from 'styled-components';
import { ImageGrid } from '../components/gallery/ImageGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Spinner } from '../components/ui/Spinner';
import { useSavedPets } from '../context/useSavedPets';
import { useUser } from '../context/useUser';
import { usePets } from '../hooks/usePets';

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.wide};
  margin: 0 auto;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.title};
`;

export function DownloadsPage() {
  const { pets, loading, error, retry } = usePets();

  useEffect(() => {
    document.title = 'Downloads — Pawpular';
  }, []);
  const { downloadedPetIds } = useSavedPets();
  const { currentUser } = useUser();

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;

  // Download history stores ids, so match them back to the loaded pet list
  const downloadedPets = pets.filter(pet => downloadedPetIds.has(pet.id));

  return (
    <Page>
      <Header>
        <Title>{currentUser?.username}'s Downloads</Title>
      </Header>
      {downloadedPets.length === 0 ? (
        <EmptyState message="No downloaded pets yet." />
      ) : (
        <ImageGrid pets={downloadedPets} />
      )}
    </Page>
  );
}
