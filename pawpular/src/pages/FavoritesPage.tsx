import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ImageGrid } from '../components/gallery/ImageGrid';
import { SelectionBar } from '../components/gallery/SelectionBar';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Spinner } from '../components/ui/Spinner';
import { useSavedPets } from '../context/useSavedPets';
import { useFollow } from '../context/useFollow';
import { useUser } from '../context/useUser';
import { useSelection } from '../context/useSelection';
import { usePets } from '../hooks/usePets';
import { downloadAsZip } from '../utils/download';

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.wide};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 40px) clamp(16px, 4vw, 40px) 80px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(26px, 3.5vw, 36px);
  line-height: 1.05;
  margin-bottom: clamp(16px, 2vw, 24px);
`;

const TabRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: clamp(16px, 2vw, 28px);
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 18px 10px;
  border: 0;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

export function FavoritesPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The same page renders both saved favorites and followed pets
  const activeTab = pathname === '/following' ? 'following' : 'favorites';

  useEffect(() => {
    document.title = activeTab === 'following' ? 'Following — Pawpular' : 'Favorites — Pawpular';
  }, [activeTab]);

  const { pets, loading, error, retry } = usePets();
  const { favoritePetIds, recordDownloadedPets } = useSavedPets();
  const { followedPetIds } = useFollow();
  const { currentUser, isAuthenticated } = useUser();
  const { selectedPetIds, selectAll } = useSelection();
  const [isDownloading, setIsDownloading] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;

  // Lists are derived from the full pet catalog using saved id sets
  const favoritePets = pets.filter(pet => favoritePetIds.has(pet.id));
  const followedPets = pets.filter(pet => followedPetIds.has(pet.id));
  const displayPets = activeTab === 'favorites' ? favoritePets : followedPets;

  async function handleDownload() {
    const selected = displayPets.filter(p => selectedPetIds.has(p.id));
    if (selected.length === 0) return;
    setIsDownloading(true);
    try {
      await downloadAsZip(selected);
      if (isAuthenticated) recordDownloadedPets(selected);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Page>
      <Title>{currentUser?.username ? `${currentUser.username}'s Pets` : 'My Pets'}</Title>
      <TabRow>
        <Tab $active={activeTab === 'following'} onClick={() => navigate('/following')}>
          Following{followedPets.length > 0 && ` (${followedPets.length})`}
        </Tab>
        <Tab $active={activeTab === 'favorites'} onClick={() => navigate('/favorites')}>
          Favorites{favoritePets.length > 0 && ` (${favoritePets.length})`}
        </Tab>
      </TabRow>
      <SelectionBar
        onDownload={handleDownload}
        onSelectAll={() => selectAll(displayPets)}
        totalCount={displayPets.length}
        isDownloading={isDownloading}
      />
      {displayPets.length === 0 ? (
        <EmptyState message={activeTab === 'favorites' ? 'No favorites yet.' : "You haven't followed any pets yet."} />
      ) : (
        <ImageGrid pets={displayPets} compact={activeTab === 'favorites'} />
      )}
    </Page>
  );
}
