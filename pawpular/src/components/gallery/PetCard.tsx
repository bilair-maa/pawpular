import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Check } from 'lucide-react';
import { useSavedPets } from '../../context/useSavedPets';
import { useUser } from '../../context/useUser';
import { useLoginModal } from '../../context/LoginModalContext';
import type { Pet } from '../../types/pet';
import { getAnimalLabel } from '../../utils/animalType';
import { FollowButton } from './FollowButton';

// Card is the reusable gallery tile for one pet
const Card = styled.article<{ $selected: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme, $selected }) => $selected
    ? `${theme.shadows.cardSelected} ${theme.colors.primary}, ${theme.shadows.panel} ${theme.colors.shadow}`
    : theme.shadows.card};
  overflow: hidden;
  position: relative;
  /* forces GPU layer — prevents hairline border-radius rendering artifact */
  transform: translateZ(0);
  transition: transform 0.28s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-4px) translateZ(0);
  }
`;

// Photo contains the image and its hover overlay controls
const Photo = styled.div<{ $loaded: boolean }>`
  position: relative;
  border-radius: ${({ theme }) => theme.radii.lg} ${({ theme }) => theme.radii.lg} 0 0;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  overflow: hidden;
  aspect-ratio: ${({ $loaded }) => $loaded ? 'auto' : '4/3'};
`;

const Overlay = styled.span`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, ${({ theme }) => theme.colors.darkOverlayHover} 0%, transparent 42%);
  opacity: 0;
  transition: opacity 0.3s ease;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 1;
  }
`;

const BadgeRow = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 2;
`;

const RightBadges = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

// ControlButton is the shared base for select and favorite overlay buttons
const ControlButton = styled.button<{ $active?: boolean }>`
  width: ${({ theme }) => theme.controls.compact};
  height: ${({ theme }) => theme.controls.compact};
  box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadowStrong}`};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 900;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $active }) => $active ? 1 : 0};
  transform: ${({ $active }) => $active ? 'scale(1)' : 'scale(0.74)'};
  transition: opacity 0.2s ease, transform 0.18s cubic-bezier(.34, 1.56, .64, 1), background-color 0.15s, color 0.15s, border-color 0.15s;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    transform: scale(1.08);
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
  }
`;

const SelectButton = styled(ControlButton)`
  color: ${({ theme, $active }) => $active ? theme.colors.surface : 'transparent'};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.selectionOverlay};
  border: ${({ theme }) => theme.borders.strong} solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.whiteOverlay};
  border-radius: ${({ theme }) => theme.radii.sm};
  backdrop-filter: blur(4px);

  &:hover {
    color: ${({ theme, $active }) => $active ? theme.colors.surface : 'transparent'};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: ${({ theme }) => theme.icons.xs};
    height: ${({ theme }) => theme.icons.xs};
    stroke-width: ${({ theme }) => theme.borders.heavy};
  }
`;

const FavoriteButton = styled(ControlButton)`
  color: ${({ theme, $active }) => $active ? theme.colors.favorite : theme.colors.textMuted};
  background-color: ${({ theme }) => theme.colors.whiteOverlay};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.circle};
  backdrop-filter: blur(6px);

  svg { width: ${({ theme }) => theme.icons.md}; height: ${({ theme }) => theme.icons.md}; stroke-width: 2; }

  &:hover { color: ${({ theme }) => theme.colors.favorite}; }
`;

const Image = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: auto;
  display: block;
  opacity: ${({ $loaded }) => $loaded ? 1 : 0};
  transition: opacity 0.35s ease, transform 0.6s cubic-bezier(.4, .8, .3, 1);

  ${Card}:hover & {
    transform: scale(1.04);
  }
`;

const ImageLink = styled(Link)`
  display: block;

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.insetOffset};
  }
`;

const ImageButton = styled.button`
  display: block;
  width: 100%;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
  text-align: inherit;

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.insetOffset};
  }
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 700;
  line-height: 1.25;
`;

const TitleButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 700;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Species = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  text-transform: uppercase;
`;

const TitleText = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

interface PetCardProps {
  pet: Pet;
  isSelected: boolean;
  onToggle: (pet: Pet) => void;
  onOpen?: (pet: Pet) => void;
  compact?: boolean;
}

// A single pet card with the photo, hover buttons (select / follow / favorite), and title
export const PetCard = React.memo(function PetCard({ pet, isSelected, onToggle, onOpen, compact = false }: PetCardProps) {
  const { isFavorite, toggleFavorite } = useSavedPets();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  const favorite = isFavorite(pet.id);
  const [loaded, setLoaded] = React.useState(false); // Fades the photo in once it finishes loading

  // Prompts sign-in if not logged in, otherwise toggles the heart
  function handleFavoriteToggle() {
    if (!isAuthenticated) {
      openLogin('register');
      return;
    }
    toggleFavorite(pet.id);
  }

  // Stops the click reaching the card's link so the overlay buttons work on their own
  function handleControlClick(event: React.MouseEvent<HTMLButtonElement>, action: () => void) {
    event.stopPropagation();
    action();
  }

  // Shared image markup used by both the button and link versions
  const image = (
    <Image
      src={pet.imageUrl}
      alt={pet.title}
      loading="lazy"
      $loaded={loaded}
      onLoad={() => setLoaded(true)}
    />
  );

  return (
    <Card $selected={isSelected}>
      <Photo $loaded={loaded}>
        {onOpen ? (
          <ImageButton type="button" aria-label={`View details for ${pet.title}`} onClick={() => onOpen(pet)}>
            {image}
          </ImageButton>
        ) : (
          <ImageLink to={`/pets/${pet.id}`} aria-label={`View details for ${pet.title}`}>
            {image}
          </ImageLink>
        )}
        <Overlay aria-hidden="true" />
        <BadgeRow>
          <SelectButton
            type="button"
            $active={isSelected}
            aria-pressed={isSelected}
            aria-label={`${isSelected ? 'Remove' : 'Select'} ${pet.title}`}
            onClick={(event) => handleControlClick(event, () => onToggle(pet))}
          >
            {isSelected && <Check aria-hidden="true" />}
          </SelectButton>
          <RightBadges>
            <FollowButton petId={pet.id} petName={pet.title} inCard />
            <FavoriteButton
              type="button"
              $active={favorite}
              aria-pressed={favorite}
              aria-label={`${favorite ? 'Remove from' : 'Add to'} favorites: ${pet.title}`}
              onClick={(event) => handleControlClick(event, handleFavoriteToggle)}
            >
              <Heart fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
            </FavoriteButton>
          </RightBadges>
        </BadgeRow>
      </Photo>
      {!compact && (
        <Body>
          <TitleRow>
            <Title>
              {onOpen ? (
                <TitleButton type="button" onClick={() => onOpen(pet)}>{pet.title}</TitleButton>
              ) : (
                <TitleText>{pet.title}</TitleText>
              )}
            </Title>
            <Species>{getAnimalLabel(pet)}</Species>
          </TitleRow>
          <Description>{pet.description}</Description>
        </Body>
      )}
    </Card>
  );
});
