import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { usePets } from '../hooks/usePets';
import { useSelection } from '../context/useSelection';
import { useSavedPets } from '../context/useSavedPets';
import { useUser } from '../context/useUser';
import { ImageGrid } from '../components/gallery/ImageGrid';
import { SkeletonCard } from '../components/gallery/SkeletonCard';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { Toolbar, type SortOption } from '../components/gallery/Toolbar';
import { SelectionBar } from '../components/gallery/SelectionBar';
import { SlideshowModal } from '../components/gallery/SlideshowModal';
import { Lightbox } from '../components/gallery/Lightbox';
import { downloadAsZip } from '../utils/download';
import { getAnimalType, type AnimalType } from '../utils/animalType';
import { filterPets, sortPets } from '../utils/filterPets';
import { useLoginModal } from '../context/LoginModalContext';
import { Play } from 'lucide-react';
import type { Pet } from '../types/pet';

const PAGE_SIZE = 8; // Number of pets added each time infinite scroll loads more

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.full};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 36px) clamp(16px, 4vw, 40px) 80px;
`;

const Header = styled.header`
  margin-bottom: clamp(16px, 2.5vw, 28px);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(26px, 3.5vw, 36px);
  line-height: 1.05;
`;

const Intro = styled.p`
  max-width: 560px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  line-height: 1.55;
  margin-top: 8px;
`;

const ResultRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 0 10px;
`;

const ResultNote = styled.p`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 800;
`;

const SelectAllLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { opacity: 0.75; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; border-radius: 2px; }
`;

const SlideshowButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.primary};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 900;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg { width: ${({ theme }) => theme.icons.md}; height: ${({ theme }) => theme.icons.md}; }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.warningBg};
  color: ${({ theme }) => theme.colors.warning};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
`;

const WarningDismiss = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1;
  padding: 0 2px;
  opacity: 0.7;
  &:hover { opacity: 1; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.warning};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
`;

export function GalleryPage() {
  const { pets, loading, error, isEmpty, retry } = usePets();
  const { selectedPetIds, toggle, selectAll, clearSelection } = useSelection();
  const { isFavorite, toggleFavorite, recordDownloadedPets } = useSavedPets();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  // Toolbar state: search text, animal filters, and sort order
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<AnimalType>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadWarning, setDownloadWarning] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Gallery — Pawpular';
  }, []);

  useEffect(() => {
    setDownloadWarning(null);
  }, [selectedPetIds]);

  const [showSlideshow, setShowSlideshow] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null); // Open pet index for the full-screen photo viewer
  const [pagination, setPagination] = useState({ key: '', count: PAGE_SIZE });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const paginationKeyRef = useRef('');
  const sortedPetsLengthRef = useRef(0);

  function toggleFilter(type: AnimalType) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }

  const filteredPets = useMemo(
    () => filterPets(pets, searchQuery, activeFilters),
    [pets, searchQuery, activeFilters],
  );

  const sortedPets = useMemo(
    () => sortPets(filteredPets, sortOption),
    [filteredPets, sortOption],
  );

  // Resets infinite scroll when search, filters, or sort changes
  const paginationKey = useMemo(() => {
    const filters = [...activeFilters].sort().join(',');
    return `${searchQuery.trim()}|${filters}|${sortOption}`;
  }, [searchQuery, activeFilters, sortOption]);

  const visibleCount = pagination.key === paginationKey ? pagination.count : PAGE_SIZE;

  const visiblePets = useMemo(
    () => sortedPets.slice(0, visibleCount),
    [sortedPets, visibleCount],
  );

  const hasMorePets = visiblePets.length < sortedPets.length;

  useEffect(() => {
    paginationKeyRef.current = paginationKey;
    sortedPetsLengthRef.current = sortedPets.length;
  }, [paginationKey, sortedPets.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMorePets) return;
    // Watches the tiny sentinel below the grid to load the next page
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPagination(prev => {
          const key = paginationKeyRef.current;
          const total = sortedPetsLengthRef.current;
          const currentCount = prev.key === key ? prev.count : PAGE_SIZE;
          if (currentCount >= total) return prev;
          return { key, count: Math.min(currentCount + PAGE_SIZE, total) };
        });
      },
      { rootMargin: '300px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePets]);

  // Counts all animals so the filter menu can show available categories
  const animalCounts = useMemo(() => {
    const counts: Partial<Record<AnimalType, number>> = {};
    pets.forEach(pet => {
      const t = getAnimalType(pet);
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return counts;
  }, [pets]);

  async function handleDownload() {
    const selectedPets = pets.filter(p => selectedPetIds.has(p.id));
    setIsDownloading(true);
    setDownloadWarning(null);
    try {
      const { failedCount } = await downloadAsZip(selectedPets);
      if (isAuthenticated) recordDownloadedPets(selectedPets);
      clearSelection();
      if (failedCount > 0) {
        setDownloadWarning(`${failedCount} image${failedCount === 1 ? '' : 's'} couldn't be downloaded and ${failedCount === 1 ? 'was' : 'were'} skipped.`);
      }
    } finally {
      setIsDownloading(false);
    }
  }

  function handleOpenPet(pet: Pet) {
    // PetCard passes the pet; Lightbox needs its index in the sorted list
    const nextIndex = sortedPets.findIndex(item => item.id === pet.id);
    if (nextIndex >= 0) setLightboxIndex(nextIndex);
  }

  function handleToggleFavorite(pet: Pet) {
    if (!isAuthenticated) {
      openLogin('register');
      return;
    }
    toggleFavorite(pet.id);
  }

  async function handleLightboxDownload(pet: Pet) {
    setIsDownloading(true);
    try {
      await downloadAsZip([pet]);
      if (isAuthenticated) recordDownloadedPets([pet]);
    } finally {
      setIsDownloading(false);
    }
  }

  if (loading) return (
    <Page>
      <Header>
        <Eyebrow>The Gallery</Eyebrow>
        <TitleRow><Title>Meet everyone</Title></TitleRow>
      </Header>
      <SkeletonGrid>
        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
      </SkeletonGrid>
    </Page>
  );
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (isEmpty) return <EmptyState message="No pets are available right now." />;

  return (
    <Page>
      <Header>
        <Eyebrow>The Gallery</Eyebrow>
        <TitleRow>
          <Title>Meet everyone</Title>
          {sortedPets.length > 0 && (
            <SlideshowButton type="button" onClick={() => setShowSlideshow(true)}>
              <Play aria-hidden="true" />
              Slideshow
            </SlideshowButton>
          )}
        </TitleRow>
        <Intro>
          Search, filter by species, and sort to find your favorites. Tap any friend to take a closer look.
        </Intro>
      </Header>
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearFilters={() => setActiveFilters(new Set())}
        animalCounts={animalCounts}
      />
      <SelectionBar
        onDownload={handleDownload}
        onSelectAll={() => selectAll(filteredPets)}
        totalCount={filteredPets.length}
        isDownloading={isDownloading}
      />
      {downloadWarning && (
        <WarningBanner role="status">
          {downloadWarning}
          <WarningDismiss
            type="button"
            onClick={() => setDownloadWarning(null)}
            aria-label="Dismiss warning"
          >
            ×
          </WarningDismiss>
        </WarningBanner>
      )}
      <ResultRow>
        <ResultNote>
          Showing {visiblePets.length} of {sortedPets.length} {sortedPets.length === 1 ? 'friend' : 'friends'}
        </ResultNote>
        {filteredPets.length > 0 && (() => {
          const allSelected = filteredPets.every(p => selectedPetIds.has(p.id));
          return (
            <SelectAllLink onClick={() => allSelected ? clearSelection() : selectAll(filteredPets)}>
              {allSelected ? 'Clear all' : 'Select all'}
            </SelectAllLink>
          );
        })()}
      </ResultRow>
      {sortedPets.length === 0 ? (
        <EmptyState message={searchQuery.trim() || activeFilters.size > 0 ? 'No pets match your filters.' : undefined} />
      ) : (
        <>
          <ImageGrid pets={visiblePets} onOpenPet={handleOpenPet} />
          {hasMorePets && <div ref={sentinelRef} style={{ height: 1 }} />}
        </>
      )}
      {showSlideshow && (
        <SlideshowModal pets={sortedPets} onClose={() => setShowSlideshow(false)} />
      )}
      {lightboxIndex !== null && sortedPets[lightboxIndex] && (
        <Lightbox
          pets={sortedPets}
          activeIndex={lightboxIndex}
          isSelected={selectedPetIds.has(sortedPets[lightboxIndex].id)}
          isFavorite={isFavorite(sortedPets[lightboxIndex].id)}
          isDownloading={isDownloading}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onToggleSelected={toggle}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleLightboxDownload}
        />
      )}
    </Page>
  );
}
