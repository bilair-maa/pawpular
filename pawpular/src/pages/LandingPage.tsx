import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import styled from 'styled-components';
import { usePets } from '../hooks/usePets';
import { useSavedPets } from '../context/useSavedPets';
import { useUser } from '../context/useUser';
import { useLoginModal } from '../context/LoginModalContext';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { animalTypeLabels, getAnimalType } from '../utils/animalType';
import type { Pet } from '../types/pet';

const Page = styled.main`
  overflow: hidden;
  padding-bottom: 60px;
`;

const Hero = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(24px, 4vw, 52px) clamp(16px, 4vw, 40px) clamp(24px, 4vw, 48px);
  display: grid;
  grid-template-columns: 1.02fr 0.98fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const HeroLogo = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(36px, 5.5vw, 64px);
  line-height: 1;
  max-width: 600px;
  margin-bottom: 0;
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(${({ theme }) => theme.fontSizes.base}, 1.6vw, 1.1rem);
  line-height: 1.55;
  max-width: 520px;
  margin-top: 18px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 24px;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 2px 10px -4px ${({ theme }) => theme.colors.shadowStrong};
  min-height: ${({ theme }) => theme.controls.large};
  padding: 0 20px;
  text-decoration: none;
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: transform 0.16s cubic-bezier(.34, 1.56, .64, 1), background-color 0.2s ease;

  &:hover { background-color: ${({ theme }) => theme.colors.primaryHover}; transform: translateY(-1px); }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.accent}; outline-offset: 3px; }
`;

const TextLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.sm};

  &:hover { color: ${({ theme }) => theme.colors.text}; background-color: ${({ theme }) => theme.colors.surface}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 3px; }
`;

const Stats = styled.dl`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: 28px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
`;

const Stat = styled.div`
  position: relative;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: baseline;

  & + &::before {
    content: "";
    position: absolute;
    left: -11px;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: ${({ theme }) => theme.radii.circle};
    background-color: ${({ theme }) => theme.colors.borderStrong};
    transform: translateY(-50%);
  }
`;

const StatValue = styled.dt`
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-weight: 900;
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const StatLabel = styled.dd`color: ${({ theme }) => theme.colors.textMuted};`;

const FeatureCard = styled.article`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 14px 40px 48px -22px ${({ theme }) => theme.colors.shadowStrong};
  overflow: hidden;
  position: relative;
  transition: transform 0.4s cubic-bezier(.4, .8, .3, 1);

  &:hover { transform: translateY(-4px); }
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  z-index: 1;
  width: ${({ theme }) => theme.controls.base};
  height: ${({ theme }) => theme.controls.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.circle};
  color: ${({ theme, $active }) => $active ? theme.colors.surface : theme.colors.text};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.surface};
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  display: grid;
  place-items: center;

  svg { width: ${({ theme }) => theme.icons.md}; height: ${({ theme }) => theme.icons.md}; }

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; transform: scale(1.06); }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.accent}; outline-offset: 3px; }
`;

const FeatureImageLink = styled(Link)`
  display: block;
  aspect-ratio: 16 / 11;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  overflow: hidden;

  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.accent}; outline-offset: -6px; }
`;

const FeatureImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s cubic-bezier(.4, .8, .3, 1);
  ${FeatureCard}:hover & { transform: scale(1.05); }
`;

const FeatureBody = styled.div`padding: clamp(16px, 2vw, 22px);`;

const FeatureLabel = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const FeatureTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(24px, 3.5vw, 36px);
  line-height: 1.1;
  margin: ${({ theme }) => theme.spacing.xs} 0 ${({ theme }) => theme.spacing.sm};
`;

const FeatureText = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Pill = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
`;

const MeetLink = styled(PrimaryLink)`
  width: 100%;
  min-height: ${({ theme }) => theme.controls.base};
`;

/* ── carousel section ─────────────────────────────────────────────────────── */

const Friends = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(8px, 1.5vw, 16px) clamp(16px, 4vw, 40px) 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: 18px;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1;
`;

const CarouselWrap = styled.div`
  position: relative;

  /* arrows revealed on hover of the whole row */
  &:hover [data-carousel-arrow] {
    opacity: 1;
    pointer-events: auto;
  }
`;

/*
 * Arrows sit just outside the list edges (not on top of cards).
 * Hidden by default, fade in when the row is hovered.
 * Only rendered at all when there's somewhere to scroll — no left arrow at start.
 */
const CarouselArrow = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 38%;
  ${({ $side }) => $side}: -14px;
  transform: translateY(-50%);
  z-index: 3;
  width: 32px;
  height: 32px;
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

const FriendList = styled.ul`
  display: flex;
  gap: 18px;
  list-style: none;
  overflow-x: auto;
  padding: ${({ theme }) => theme.spacing.xs} 2px 14px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }
`;

const FriendItem = styled.li`
  flex: 0 0 clamp(200px, 28vw, 260px);
  scroll-snap-align: start;

  @media (max-width: 720px) { flex-basis: 75vw; }
`;

const FriendCard = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 2px 10px -4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.28s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s ease;

  &:hover { transform: translateY(-4px); box-shadow: 0 10px 32px -8px ${({ theme }) => theme.colors.shadowStrong}; }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.accent}; outline-offset: 3px; }
`;

const FriendImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  transition: transform 0.6s cubic-bezier(.4, .8, .3, 1);
  ${FriendCard}:hover & { transform: scale(1.06); }
`;

const FriendBody = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const FriendTitleRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  justify-content: space-between;
`;

const FriendTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  line-height: 1.1;
`;

const Species = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const FriendDescription = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

/* ── helpers ──────────────────────────────────────────────────────────────── */


function hashDay(day: number) {
  // Knuth multiplicative hash — scrambles sequential day numbers into a random-looking spread
  return ((day * 2_654_435_761) >>> 0);
}

function getFeaturedPet(pets: Pet[]) {
  if (pets.length === 1) return pets[0];
  const day = Math.floor(Date.now() / 86_400_000);
  const prevIdx = hashDay(day - 1) % pets.length;
  // Pick from the remaining (length - 1) slots, then skip past yesterday's pick
  let idx = hashDay(day) % (pets.length - 1);
  if (idx >= prevIdx) idx++;
  return pets[idx]!;
}

/* ── component ────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { pets, loading, error, isEmpty, retry } = usePets();

  useEffect(() => {
    document.title = 'Pawpular — Discover Your Next Best Friend';
  }, []);
  const { isAuthenticated } = useUser();
  const { isFavorite, toggleFavorite } = useSavedPets();
  const { openLogin } = useLoginModal();
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = listRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    // Re-check scroll bounds after pets load / layout settles
    const id = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(id);
  }, [pets.length]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (isEmpty) return <EmptyState message="No pets are available right now." />;

  // Daily feature rotates by date but avoids repeating yesterday's pet
  const featuredPet = getFeaturedPet(pets);
  const newestPets = [...pets]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 8);
  const speciesCount = new Set(pets.map(getAnimalType)).size;
  const featuredType = animalTypeLabels[getAnimalType(featuredPet)];

  function handleFavorite() {
    if (!isAuthenticated) {
      openLogin('register');
      return;
    }
    toggleFavorite(featuredPet.id);
  }

  function scrollCarousel(dir: 1 | -1) {
    listRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  return (
    <Page>
      <Hero aria-labelledby="landing-heading">
        <div>
          <HeroLogo src="/logo.png" alt="Pawpular" />
          <Eyebrow>Welcome to Pawpular</Eyebrow>
          <Title id="landing-heading">A little gallery for very good company.</Title>
          <Intro>
            Meet the internet&apos;s most charming animals, each with a name, a story, and the spotlight they deserve.
            Browse, favorite, and collect your favorites.
          </Intro>
          <Actions>
            <PrimaryLink to="/gallery">Browse The Gallery</PrimaryLink>
            <TextLink to="/about">Our Story &rarr;</TextLink>
          </Actions>
          <Stats aria-label="Gallery statistics">
            <Stat><StatValue>{pets.length}</StatValue><StatLabel>friends</StatLabel></Stat>
            <Stat><StatValue>{speciesCount}</StatValue><StatLabel>species</StatLabel></Stat>
            <Stat><StatValue>∞</StatValue><StatLabel>belly rubs</StatLabel></Stat>
          </Stats>
        </div>

        <FeatureCard>
          <FavoriteButton
            type="button"
            $active={isFavorite(featuredPet.id)}
            aria-pressed={isFavorite(featuredPet.id)}
            aria-label={`${isFavorite(featuredPet.id) ? 'Remove from' : 'Add to'} favorites: ${featuredPet.title}`}
            onClick={handleFavorite}
          >
            <Heart fill={isFavorite(featuredPet.id) ? 'currentColor' : 'none'} aria-hidden="true" />
          </FavoriteButton>
          <FeatureImageLink to={`/pets/${featuredPet.id}`} aria-label={`View ${featuredPet.title}`}>
            <FeatureImage src={featuredPet.imageUrl} alt={featuredPet.title} />
          </FeatureImageLink>
          <FeatureBody>
            <FeatureLabel>{featuredType} · Today&apos;s Star</FeatureLabel>
            <FeatureTitle>{featuredPet.title}</FeatureTitle>
            <FeatureText>{featuredPet.description}</FeatureText>
            <PillRow><Pill>Foodie</Pill><Pill>Stunning</Pill></PillRow>
            <MeetLink to={`/pets/${featuredPet.id}`}>Meet {featuredPet.title}</MeetLink>
          </FeatureBody>
        </FeatureCard>
      </Hero>

      <Friends aria-labelledby="newest-heading">
        <Eyebrow>Fresh Faces</Eyebrow>
        <SectionHeader>
          <SectionTitle id="newest-heading">Newest Friends</SectionTitle>
          <TextLink to="/gallery">View All &rarr;</TextLink>
        </SectionHeader>

        <CarouselWrap>
          {canScrollLeft && (
            <CarouselArrow
              data-carousel-arrow
              type="button"
              $side="left"
              aria-label="Scroll left"
              onClick={() => scrollCarousel(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </CarouselArrow>
          )}
          {canScrollRight && (
            <CarouselArrow
              data-carousel-arrow
              type="button"
              $side="right"
              aria-label="Scroll right"
              onClick={() => scrollCarousel(1)}
            >
              <ChevronRight aria-hidden="true" />
            </CarouselArrow>
          )}

          <FriendList ref={listRef} onScroll={updateScrollState}>
            {newestPets.map((pet) => (
              <FriendItem key={pet.id}>
                <FriendCard to={`/pets/${pet.id}`}>
                  <FriendImage src={pet.imageUrl} alt="" loading="lazy" />
                  <FriendBody>
                    <FriendTitleRow>
                      <FriendTitle>{pet.title}</FriendTitle>
                      <Species>{animalTypeLabels[getAnimalType(pet)]}</Species>
                    </FriendTitleRow>
                    <FriendDescription>{pet.description}</FriendDescription>
                  </FriendBody>
                </FriendCard>
              </FriendItem>
            ))}
          </FriendList>
        </CarouselWrap>
      </Friends>
    </Page>
  );
}
