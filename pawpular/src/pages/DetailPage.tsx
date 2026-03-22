import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Heart, Download, Check, ChevronLeft, ChevronRight, UserPlus, UserCheck, Camera } from 'lucide-react';
import { ShareIcon } from '../components/ui/ShareIcon';
import { useSavedPets } from '../context/useSavedPets';
import { useUser } from '../context/useUser';
import { useLoginModal } from '../context/LoginModalContext';
import { useFollow } from '../context/useFollow';
import { useSelection } from '../context/useSelection';
import { usePets } from '../hooks/usePets';
import { downloadAsZip } from '../utils/download';
import { buildCrews } from '../utils/buildCrews';
import { formatBytes } from '../utils/formatBytes';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Spinner } from '../components/ui/Spinner';
import { getAnimalType, getAnimalLabel } from '../utils/animalType';
import type { Pet } from '../types/pet';

// ── layout ────────────────────────────────────────────────────────────────────

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.full};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 36px) clamp(16px, 3vw, 40px) clamp(60px, 8vw, 100px);
`;

const PageGlow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: radial-gradient(ellipse 120% 50vh at 50% -10%, oklch(0.93 0.050 58 / 0.4), transparent);
  pointer-events: none;
  z-index: -1;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.xs};

  &:hover { color: ${({ theme }) => theme.colors.text}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }

  svg { width: ${({ theme }) => theme.icons.sm}; height: ${({ theme }) => theme.icons.sm}; }
`;

const Detail = styled.article`
  display: grid;
  grid-template-columns: 3fr 2.5fr;
  gap: clamp(20px, 4vw, 40px);
  align-items: start;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

// ── hero image ────────────────────────────────────────────────────────────────

const heartPop = keyframes`
  0%   { opacity: 0; transform: scale(0.2); }
  40%  { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.5); }
`;

const HeroCard = styled.div`
  align-self: center;
  min-width: 0;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: 0 16px 48px -16px ${({ theme }) => theme.colors.shadowStrong};
  position: relative;
  cursor: pointer;
`;

const HeroImage = styled.img`
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: clamp(400px, 68vh, 700px);
  pointer-events: none;
`;

const HeartBurst = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  animation: ${heartPop} 0.65s ease forwards;
  color: ${({ theme }) => theme.colors.white};
  filter: drop-shadow(0 4px 24px ${({ theme }) => theme.colors.darkOverlay});
  z-index: 2;

  svg { width: ${({ theme }) => theme.icons.hero}; height: ${({ theme }) => theme.icons.hero}; }
`;

const HeroSelectBtn = styled.button<{ $active: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  z-index: 3;
  width: ${({ theme }) => theme.controls.compact};
  height: ${({ theme }) => theme.controls.compact};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $active }) => $active ? theme.colors.surface : 'transparent'};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.selectionOverlay};
  border: ${({ theme }) => theme.borders.strong} solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.whiteOverlay};
  border-radius: ${({ theme }) => theme.radii.sm};
  backdrop-filter: blur(4px);
  box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadowStrong}`};
  cursor: pointer;
  font: inherit;
  opacity: ${({ $active }) => $active ? 1 : 0};
  transform: ${({ $active }) => $active ? 'scale(1)' : 'scale(0.74)'};
  transition: color 0.15s, background-color 0.15s, border-color 0.15s, opacity 0.2s ease, transform 0.18s cubic-bezier(.34, 1.56, .64, 1);

  ${HeroCard}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    color: ${({ theme, $active }) => $active ? theme.colors.surface : 'transparent'};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.08);
  }
  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
    opacity: 1;
    transform: scale(1);
  }

  svg {
    width: ${({ theme }) => theme.icons.xs};
    height: ${({ theme }) => theme.icons.xs};
    stroke-width: ${({ theme }) => theme.borders.heavy};
  }
`;

// ── right column ──────────────────────────────────────────────────────────────

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vw, 20px);
  min-width: 0;
`;

// ── info panel ────────────────────────────────────────────────────────────────

const InfoCard = styled.div`
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => `${theme.shadows.panel} ${theme.colors.shadow}`};
  padding: clamp(20px, 3vw, 28px);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, oklch(0.78 0.11 48));
  }
`;

const SpeciesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SpeciesChip = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const MetaSubtle = styled.span`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FollowChipBtn = styled.button<{ $following: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: ${({ theme }) => theme.controls.compact};
  padding: 0 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $following, theme }) => $following ? theme.colors.primarySoft : 'transparent'};
  color: ${({ theme }) => theme.colors.primary};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.18s cubic-bezier(.34, 1.56, .64, 1);

  svg { width: ${({ theme }) => theme.icons.xs}; height: ${({ theme }) => theme.icons.xs}; stroke-width: 2.5; }

  &:hover { background: ${({ theme }) => theme.colors.primarySoft}; transform: scale(1.04); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const PetName = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.05;
`;

const PetDescription = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  line-height: 1.6;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.border}, transparent);
  margin: 2px 0;
`;

const ActionRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionBtn = styled.button<{ $active?: boolean; $primary?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 10px;
  color: ${({ theme, $active, $primary }) =>
    $primary ? theme.colors.surface :
    $active   ? theme.colors.primary :
    theme.colors.textMuted};
  background-color: ${({ theme, $active, $primary }) =>
    $primary ? theme.colors.primary :
    $active   ? theme.colors.primarySoft :
    'transparent'};
  border: 1px solid ${({ theme, $active, $primary }) =>
    $primary ? theme.colors.primary :
    $active   ? theme.colors.primary :
    theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme, $primary }) => $primary ? `${theme.shadows.control} ${theme.colors.shadowStrong}` : 'none'};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;

  svg {
    width: ${({ theme }) => theme.icons.sm};
    height: ${({ theme }) => theme.icons.sm};
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${({ theme, $primary }) => $primary ? theme.colors.primaryHover : undefined};
    color: ${({ theme, $primary }) => $primary ? theme.colors.surface : theme.colors.text};
    border-color: ${({ theme, $primary }) => $primary ? theme.colors.primaryHover : theme.colors.borderStrong};
    transform: ${({ $primary }) => $primary ? 'translateY(-1px)' : 'none'};
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: ${({ theme }) => theme.focus.offset}; }
`;

// ── crews card ────────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
`;

const CrewsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => `${theme.shadows.panel} ${theme.colors.shadow}`};
  padding: clamp(18px, 2.5vw, 24px);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  animation: ${slideIn} 0.4s cubic-bezier(0.34, 1.1, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const CrewsEyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CrewsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  line-height: 1.2;
  margin-top: -4px;
`;

// Horizontal scroll strip — same pattern as PetStrip
const CrewStrip = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  padding: 6px 2px 4px;
  min-width: 0;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const CrewStripItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  width: 80px;
  text-decoration: none;

  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 4px; border-radius: ${({ theme }) => theme.radii.sm}; }
`;

const CrewStripAvatars = styled.div`
  display: flex;
  align-items: center;
`;

const CrewStripAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  object-position: center 18%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  margin-left: -8px;
  transition: box-shadow 0.15s ease;

  &:first-child { margin-left: 0; }

  ${CrewStripItem}:hover & {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const CrewStripName = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${CrewStripItem}:hover & { color: ${({ theme }) => theme.colors.primary}; }
`;

// ── more friends card ─────────────────────────────────────────────────────────

const RecoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => `${theme.shadows.panel} ${theme.colors.shadow}`};
  padding: clamp(18px, 2.5vw, 24px);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RecoTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  line-height: 1.2;
`;

const RecoCarouselWrap = styled.div`
  position: relative;
  &:hover [data-carousel-arrow] { opacity: 1; pointer-events: auto; }
`;

const RecoArrow = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 32px;
  ${({ $side }) => $side}: -14px;
  transform: translateY(-50%);
  z-index: 3;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: 0 2px 12px -4px ${({ theme }) => theme.colors.shadowStrong};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.16s cubic-bezier(.34, 1.56, .64, 1), color 0.15s;

  &:hover { color: ${({ theme }) => theme.colors.text}; transform: translateY(-50%) scale(1.1); }
  &:active { transform: translateY(-50%) scale(0.9); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; opacity: 1; pointer-events: auto; }

  svg { width: ${({ theme }) => theme.icons.sm}; height: ${({ theme }) => theme.icons.sm}; }
`;

const PetStrip = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  padding: 6px 2px 4px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const PetStripItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  width: 72px;
  text-decoration: none;
  scroll-snap-align: start;

  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: ${({ theme }) => theme.spacing.xs}; border-radius: ${({ theme }) => theme.radii.circle}; }
`;

const PetStripThumb = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  object-position: center 18%;
  border: 2.5px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.15s ease, box-shadow 0.18s ease;

  ${PetStripItem}:hover & {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const PetStripName = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${PetStripItem}:hover & { color: ${({ theme }) => theme.colors.primary}; }
`;

// ── photos section ────────────────────────────────────────────────────────────

const PhotoSection = styled.section`
  margin-top: clamp(28px, 4vw, 48px);
`;

const PhotoSectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PlaceholderCard = styled.div`
  aspect-ratio: 4 / 3;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;

  svg { width: ${({ theme }) => theme.icons.xl}; height: ${({ theme }) => theme.icons.xl}; opacity: 0.4; }
`;

const PlaceholderCaption = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CaptionLine = styled.div<{ $width?: string }>`
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.border};
  width: ${({ $width }) => $width ?? '100%'};
`;

const PHOTO_PLACEHOLDERS = [0, 1, 2, 3, 4, 5, 6, 7]; // Empty photo slots for future uploads

// ── component ─────────────────────────────────────────────────────────────────

export function DetailPage() {
  const { petId } = useParams();
  const { pets, loading, error, retry } = usePets();
  const { isFavorite, toggleFavorite, recordDownloadedPets } = useSavedPets();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  const { isFollowingPet, toggleFollowPet } = useFollow();
  const { selectedPetIds, toggle: toggleSelection } = useSelection();
  const [copied, setCopied] = useState(false);
  const [heroBurst, setHeroBurst] = useState(false);
  const lastHeroTap = useRef(0);
  const recoStripRef = useRef<HTMLDivElement>(null);
  // Tracks whether the recommendation strip can scroll left or right
  const [recoCanScrollLeft, setRecoCanScrollLeft] = useState(false);
  const [recoCanScrollRight, setRecoCanScrollRight] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [petId]);

  const petTitle = pets.find(p => p.id === petId)?.title;
  useEffect(() => {
    document.title = petTitle ? `${petTitle} — Pawpular` : 'Pawpular';
  }, [petTitle]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = recoStripRef.current;
      if (!el) return;
      setRecoCanScrollLeft(el.scrollLeft > 4);
      setRecoCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    });
    return () => cancelAnimationFrame(id);
  }, [petId]);

  const crews = useMemo(() => buildCrews(pets), [pets]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;

  const pet = pets.find(item => item.id === petId);
  if (!pet) return <EmptyState message="That pet could not be found." />;
  const currentPet: Pet = pet;

  const petCrews = crews.filter(c => c.members.some(m => m.id === currentPet.id));
  const favorite = isFavorite(currentPet.id);
  const isSelected = selectedPetIds.has(currentPet.id);
  const animalType = getAnimalType(currentPet);
  const animalLabel = getAnimalLabel(currentPet);

  // Prefer recommendations from the same species when enough are available
  const sameSpeciesPets = pets
    .filter(item => item.id !== currentPet.id && getAnimalType(item) === animalType);
  const useSameSpecies = sameSpeciesPets.length >= 2;
  const recommendedPets = useSameSpecies
    ? sameSpeciesPets
    : pets.filter(item => item.id !== currentPet.id);
  const recoTitle = useSameSpecies ? `More ${animalLabel} friends` : 'You might also like';

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(currentPet.created));

  const metaLine = [
    formattedDate,
    currentPet.fileSize != null ? formatBytes(currentPet.fileSize) : null,
  ].filter(Boolean).join(' · ');

  function handleHeroTap() {
    // Double-tapping the hero photo favorites the pet
    const now = Date.now();
    if (now - lastHeroTap.current < 300) {
      lastHeroTap.current = 0;
      if (!isAuthenticated) { openLogin('register'); return; }
      toggleFavorite(currentPet.id);
      setHeroBurst(true);
      setTimeout(() => setHeroBurst(false), 700);
    } else {
      lastHeroTap.current = now;
    }
  }

  async function handleDownload() {
    await downloadAsZip([currentPet]);
    if (isAuthenticated) recordDownloadedPets([currentPet]);
  }

  function handleFavoriteToggle() {
    if (!isAuthenticated) {
      openLogin('register');
      return;
    }
    toggleFavorite(currentPet.id);
  }

  function handleFollowPet() {
    if (!isAuthenticated) { openLogin('register'); return; }
    toggleFollowPet(currentPet.id);
  }

  function handleRecoScroll() {
    const el = recoStripRef.current;
    if (!el) return;
    setRecoCanScrollLeft(el.scrollLeft > 4);
    setRecoCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scrollReco(dir: 1 | -1) {
    recoStripRef.current?.scrollBy({ left: dir * 264, behavior: 'smooth' });
  }

  async function handleShare() {
    const url = `${window.location.origin}/pets/${currentPet.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentPet.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch { /* cancelled */ }
  }

  return (
    <Page>
      <PageGlow aria-hidden="true" />
      <PageHeader>
        <BackLink to="/gallery">
          <ChevronLeft /> Back to Gallery
        </BackLink>
        <SpeciesChip>{animalLabel}</SpeciesChip>
      </PageHeader>

      <Detail>
        <HeroCard onClick={handleHeroTap} title="Double-tap to favorite">
          <HeroImage src={pet.imageUrl} alt={pet.title} />
          {heroBurst && (
            <HeartBurst aria-hidden="true">
              <Heart fill="currentColor" />
            </HeartBurst>
          )}
          <HeroSelectBtn
            type="button"
            $active={isSelected}
            aria-pressed={isSelected}
            aria-label={isSelected ? `Remove ${pet.title} from selection` : `Select ${pet.title}`}
            onClick={(e) => { e.stopPropagation(); toggleSelection(currentPet); }}
          >
            {isSelected && <Check aria-hidden="true" />}
          </HeroSelectBtn>
        </HeroCard>

        <RightColumn>
          <InfoCard>
            <SpeciesRow>
              <MetaSubtle>{metaLine}</MetaSubtle>
              <FollowChipBtn
                type="button"
                $following={isFollowingPet(pet.id)}
                aria-pressed={isFollowingPet(pet.id)}
                aria-label={isFollowingPet(pet.id) ? `Unfollow ${pet.title}` : `Follow ${pet.title}`}
                onClick={handleFollowPet}
              >
                {isFollowingPet(pet.id)
                  ? <><UserCheck aria-hidden="true" /> Following</>
                  : <><UserPlus aria-hidden="true" /> Follow</>}
              </FollowChipBtn>
            </SpeciesRow>

            <PetName>{pet.title}</PetName>
            <PetDescription>{pet.description}</PetDescription>

            <Divider />

            <ActionRow>
              <ActionBtn
                type="button"
                $active={favorite}
                onClick={handleFavoriteToggle}
                aria-pressed={favorite}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart fill={favorite ? 'currentColor' : 'none'} />
                {favorite ? 'Favorited' : 'Favorite'}
              </ActionBtn>
              <ActionBtn type="button" $primary onClick={handleDownload}>
                <Download /> Download
              </ActionBtn>
              <ActionBtn
                type="button"
                $active={copied}
                onClick={handleShare}
                aria-label={copied ? 'Link copied' : 'Share'}
              >
                {copied ? <Check /> : <ShareIcon />}
                {copied ? 'Copied!' : 'Share'}
              </ActionBtn>
            </ActionRow>
          </InfoCard>

          {isFollowingPet(pet.id) && petCrews.length > 0 ? (
            <CrewsCard aria-label="Crews featuring this pet">
              <div>
                <CrewsEyebrow>Because you followed {pet.title.split(' ')[0]}</CrewsEyebrow>
                <CrewsTitle>Check Out Their Crews</CrewsTitle>
              </div>
              <CrewStrip>
                {petCrews.map(crew => (
                  <CrewStripItem key={crew.id} to={`/crews/${crew.id}`} aria-label={crew.name}>
                    <CrewStripAvatars aria-hidden="true">
                      {crew.members.slice(0, 3).map(m => (
                        <CrewStripAvatar key={m.id} src={m.imageUrl} alt="" />
                      ))}
                    </CrewStripAvatars>
                    <CrewStripName>{crew.name}</CrewStripName>
                  </CrewStripItem>
                ))}
              </CrewStrip>
            </CrewsCard>
          ) : recommendedPets.length > 0 ? (
            <RecoCard>
              <RecoTitle>{recoTitle}</RecoTitle>
              <RecoCarouselWrap>
                {recoCanScrollLeft && (
                  <RecoArrow
                    $side="left"
                    data-carousel-arrow=""
                    onClick={() => scrollReco(-1)}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft />
                  </RecoArrow>
                )}
                <PetStrip ref={recoStripRef} onScroll={handleRecoScroll}>
                  {recommendedPets.map(p => (
                    <PetStripItem key={p.id} to={`/pets/${p.id}`} aria-label={p.title}>
                      <PetStripThumb src={p.imageUrl} alt="" />
                      <PetStripName>{p.title}</PetStripName>
                    </PetStripItem>
                  ))}
                </PetStrip>
                {recoCanScrollRight && (
                  <RecoArrow
                    $side="right"
                    data-carousel-arrow=""
                    onClick={() => scrollReco(1)}
                    aria-label="Scroll right"
                  >
                    <ChevronRight />
                  </RecoArrow>
                )}
              </RecoCarouselWrap>
            </RecoCard>
          ) : null}
        </RightColumn>
      </Detail>

      <PhotoSection aria-label={`${pet.title}'s photos`}>
        <PhotoSectionTitle>Photos</PhotoSectionTitle>
        <PhotosGrid>
          {PHOTO_PLACEHOLDERS.map(i => (
            <div key={i}>
              <PlaceholderCard>
                <Camera aria-hidden="true" />
                Photos will appear here
              </PlaceholderCard>
              <PlaceholderCaption>
                <CaptionLine $width="70%" />
                <CaptionLine $width="50%" />
              </PlaceholderCaption>
            </div>
          ))}
        </PhotosGrid>
      </PhotoSection>
    </Page>
  );
}
