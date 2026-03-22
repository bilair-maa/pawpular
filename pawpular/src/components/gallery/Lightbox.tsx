import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styled, { keyframes } from 'styled-components';
import { Heart, Download, Check, ChevronLeft, ChevronRight, X, UserPlus, UserCheck } from 'lucide-react';
import { ShareIcon } from '../ui/ShareIcon';
import type { Pet } from '../../types/pet';
import { getAnimalLabel } from '../../utils/animalType';
import { formatBytes } from '../../utils/formatBytes';
import { useFollow } from '../../context/useFollow';
import { useUser } from '../../context/useUser';
import { useLoginModal } from '../../context/LoginModalContext';

const SWIPE_THRESHOLD = 80;
const DOUBLE_TAP_MS = 280;

// ── animations ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn  = keyframes`
  from { opacity: 0; transform: scale(0.92) translateY(12px) }
  to   { opacity: 1; transform: none }
`;
const heartPop = keyframes`
  0%   { opacity: 0; transform: scale(0.2) }
  40%  { opacity: 1; transform: scale(1.2) }
  100% { opacity: 0; transform: scale(1.5) }
`;

// ── styled components ─────────────────────────────────────────────────────────

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.scrim};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: ${fadeIn} 0.25s ease;
`;

// Dialog is the focused modal panel that holds the selected pet photo and actions
const Dialog = styled.article<{ $ratio: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: clamp(300px, calc(65vh * ${({ $ratio }) => $ratio}), min(480px, 96vw));
  max-height: 92vh;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.modal};
  animation: ${popIn} 0.32s cubic-bezier(.34, 1.56, .64, 1);
`;

// ImageWrap captures swipe and double-tap gestures on the modal photo
const ImageWrap = styled.div`
  position: relative;
  width: 100%;
  max-height: 65vh;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
  flex-shrink: 0;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;

  &:active { cursor: grabbing; }
`;

const Photo = styled.img`
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 65vh;
  margin: 0 auto;
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
  filter: drop-shadow(0 4px 20px ${({ theme }) => theme.colors.darkOverlay});

  svg { width: ${({ theme }) => theme.icons.burst}; height: ${({ theme }) => theme.icons.burst}; }
`;

const OverlayBtn = styled.button`
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.darkOverlay};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.circle};
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), background 0.2s;

  &:hover  { background: ${({ theme }) => theme.colors.darkOverlayHover}; transform: scale(1.08); }
  &:active { transform: scale(0.9); }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.white}; outline-offset: ${({ theme }) => theme.focus.offset}; }
`;

const TopButtons = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled(OverlayBtn)`
  width: 36px;
  height: 36px;
  flex-shrink: 0;

  svg { width: ${({ theme }) => theme.icons.md}; height: ${({ theme }) => theme.icons.md}; }
`;

const ScrimNavBtn = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: clamp(8px, 2vw, 28px);
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.whiteOverlayMuted};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.circle};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font: inherit;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0.55;
  z-index: 2;
  transition: opacity 0.2s, background 0.2s, transform 0.18s cubic-bezier(.34, 1.56, .64, 1);

  &:hover  { opacity: 1; background: ${({ theme }) => theme.colors.whiteOverlayHover}; transform: translateY(-50%) scale(1.08); }
  &:active { transform: translateY(-50%) scale(0.9); opacity: 1; }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.white}; outline-offset: 3px; opacity: 1; }

  svg { width: ${({ theme }) => theme.icons.xl}; height: ${({ theme }) => theme.icons.xl}; }

  @media (max-width: 600px) { display: none; }
`;

// CornerCheckbox selects this pet for bulk download without closing the lightbox
const CornerCheckbox = styled.button<{ $selected: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  width: ${({ theme }) => theme.controls.compact};
  height: ${({ theme }) => theme.controls.compact};
  z-index: 4;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.xs};
  border: ${({ theme }) => theme.borders.strong} solid ${({ theme, $selected }) => $selected ? 'transparent' : theme.colors.whiteOverlay};
  background: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.selectionOverlay};
  color: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  cursor: pointer;
  font: inherit;
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), background 0.2s, border-color 0.2s;

  &:hover  { transform: scale(1.1); border-color: ${({ theme }) => theme.colors.primary}; }
  &:active { transform: scale(0.9); }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.white}; outline-offset: ${({ theme }) => theme.focus.offset}; }

  svg { width: ${({ theme }) => theme.icons.xs}; height: ${({ theme }) => theme.icons.xs}; stroke-width: ${({ theme }) => theme.borders.heavy}; }
`;

const Counter = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  background: ${({ theme }) => theme.colors.darkOverlay};
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  white-space: nowrap;
`;

const Info = styled.div`
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
`;

const InfoTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const SpeciesChip = styled.span`
  display: inline-block;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 3px 9px;
  font-size: ${({ theme }) => theme.fontSizes.micro};
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 5px;
`;

const PetName = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  line-height: 1.1;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: 2px;
`;

const BottomActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const IconBtn = styled.button<{ $active?: boolean; $danger?: boolean; $isFollow?: boolean }>`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: ${({ theme, $active, $danger, $isFollow }) =>
    $danger && $active ? theme.colors.favorite :
    $isFollow       ? theme.colors.primary :
    $active         ? theme.colors.primary :
    theme.colors.textMuted};
  background: transparent;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.circle};
  cursor: pointer;
  font: inherit;
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), color 0.2s, background 0.2s;

  &:hover  { background: ${({ theme }) => theme.colors.surfaceAlt}; transform: scale(1.1); color: ${({ theme, $danger }) => $danger ? theme.colors.favorite : 'inherit'}; }
  &:active { transform: scale(0.88); }
  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
    border-radius: ${({ theme }) => theme.radii.circle};
  }

  svg { width: ${({ theme }) => theme.icons.lg}; height: ${({ theme }) => theme.icons.lg}; }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  margin-top: 2px;
`;

const ProfileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  text-decoration: none;
  margin-top: 4px;
  align-self: flex-start;

  &:hover { text-decoration: underline; text-underline-offset: 2px; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; border-radius: 2px; }
`;

// ── props ─────────────────────────────────────────────────────────────────────

interface LightboxProps {
  pets: Pet[];
  activeIndex: number;
  isSelected: boolean;
  isFavorite: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleSelected: (pet: Pet) => void;
  onToggleFavorite: (pet: Pet) => void;
  onDownload: (pet: Pet) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

// ── component ─────────────────────────────────────────────────────────────────

export function Lightbox({
  pets, activeIndex, isSelected, isFavorite, isDownloading,
  onClose, onNavigate, onToggleSelected, onToggleFavorite, onDownload,
}: LightboxProps) {
  const { isFollowingPet, toggleFollowPet } = useFollow();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  const pet = pets[activeIndex];
  const [dragX, setDragX]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const [imgRatio, setImgRatio] = useState(1);
  const [burst, setBurst]       = useState(false);
  const [copied, setCopied]     = useState(false);
  const [exiting, setExiting]   = useState<false | 'left' | 'right'>(false);
  const pointerStart = useRef({ x: 0, y: 0, moved: false });
  const lastTap      = useRef(0);
  const dialogRef    = useFocusTrap<HTMLElement>(true);

  // Applies the swipe-away animation before changing to the next or previous pet
  function dialogStyle(): React.CSSProperties {
    if (exiting) {
      const x = exiting === 'left' ? -window.innerWidth * 1.2 : window.innerWidth * 1.2;
      const rot = exiting === 'left' ? -22 : 22;
      return { transform: `translateX(${x}px) rotate(${rot}deg)`, transition: 'transform 0.28s ease-in' };
    }
    if (dragX !== 0 || dragging) {
      return {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(.34, 1.56, .64, 1)',
      };
    }
    return {};
  }

  function handleFollowPet() {
    if (!isAuthenticated) { openLogin('register'); return; }
    toggleFollowPet(pet.id);
  }

  async function handleShare() {
    const url = `${window.location.origin}/pets/${pet.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: pet.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch { /* cancelled */ }
  }

  // Moves through the pet list and wraps around at either end
  function go(dir: 1 | -1) {
    if (exiting) return;
    setExiting(dir === 1 ? 'left' : 'right');
    setTimeout(() => {
      setExiting(false);
      setDragX(0);
      setImgRatio(1);
      onNavigate((activeIndex + dir + pets.length) % pets.length);
    }, 280);
  }

  function handleFavorite() {
    onToggleFavorite(pet);
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  go(1);
      if (e.key === 'ArrowLeft')   go(-1);
      if (e.key === 'f' || e.key === 'F') handleFavorite();
      if (e.key === 's' || e.key === 'S') onToggleSelected(pet);
      if (e.key === 'd' || e.key === 'D') onDownload(pet);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, go, handleFavorite, onToggleSelected, onDownload, pet]);

  if (!pet) return null;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (exiting) return;
    pointerStart.current = { x: e.clientX, y: e.clientY, moved: false };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) pointerStart.current.moved = true;
    setDragX(dx);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;

    if (!pointerStart.current.moved) {
      // A double tap on the photo favorites the pet
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        handleFavorite();
      } else {
        lastTap.current = now;
      }
      setDragX(0);
      return;
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    } else {
      setDragX(0);
    }
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) setImgRatio(naturalWidth / naturalHeight);
  }

  const following = isFollowingPet(pet.id);

  return (
    <Scrim onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ScrimNavBtn type="button" $side="left" aria-label="Previous photo" onClick={() => go(-1)}>
        <ChevronLeft />
      </ScrimNavBtn>
      <ScrimNavBtn type="button" $side="right" aria-label="Next photo" onClick={() => go(1)}>
        <ChevronRight />
      </ScrimNavBtn>

      <Dialog ref={dialogRef} $ratio={imgRatio} key={pet.id} role="dialog" aria-modal="true" aria-labelledby="lb-title" style={dialogStyle()}>

        <ImageWrap onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
          <Photo key={pet.id} src={pet.imageUrl} alt={pet.title} draggable="false" onLoad={onImgLoad} />

          {burst && (
            <HeartBurst aria-hidden="true">
              <Heart fill="currentColor" />
            </HeartBurst>
          )}

          <CornerCheckbox
            type="button" $selected={isSelected}
            aria-pressed={isSelected} aria-label={isSelected ? 'Deselect' : 'Select'} title="Select (S)"
            onPointerDown={e => e.stopPropagation()} onClick={() => onToggleSelected(pet)}
          >
            {isSelected && <Check />}
          </CornerCheckbox>

          <TopButtons>
            <Counter aria-label={`${activeIndex + 1} of ${pets.length}`}>
              {activeIndex + 1} / {pets.length}
            </Counter>
            <CloseBtn type="button" aria-label="Close" onPointerDown={e => e.stopPropagation()} onClick={onClose}>
              <X />
            </CloseBtn>
          </TopButtons>
        </ImageWrap>

        <Info>
          <InfoTop>
            <TitleBlock>
              <SpeciesChip>{getAnimalLabel(pet)}</SpeciesChip>
              <PetName id="lb-title">{pet.title}</PetName>
            </TitleBlock>
            <IconBtn
              type="button"
              $isFollow
              aria-pressed={following}
              aria-label={following ? `Unfollow ${pet.title}` : `Follow ${pet.title}`}
              title="Follow"
              onClick={handleFollowPet}
            >
              {following ? <UserCheck /> : <UserPlus />}
            </IconBtn>
          </InfoTop>

          <Description>{pet.description}</Description>

          <MetaRow>
            <span>Added {formatDate(pet.created)}</span>
            {pet.fileSize != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatBytes(pet.fileSize)}</span>
              </>
            )}
          </MetaRow>

          <ProfileRow>
            <ProfileLink to={`/pets/${pet.id}`} onClick={onClose}>
              View full profile →
            </ProfileLink>
            <BottomActions>
              <IconBtn
                type="button" $active={isFavorite} $danger
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} title="Favorite (F)"
                onClick={() => onToggleFavorite(pet)}
              >
                <Heart fill={isFavorite ? 'currentColor' : 'none'} />
              </IconBtn>
              <IconBtn
                type="button" aria-label="Download" title="Download (D)"
                onClick={() => onDownload(pet)} disabled={isDownloading}
              >
                <Download />
              </IconBtn>
              <IconBtn
                type="button" $active={copied}
                aria-label={copied ? 'Link copied' : 'Share'} title="Share"
                onClick={handleShare}
              >
                {copied ? <Check /> : <ShareIcon />}
              </IconBtn>
            </BottomActions>
          </ProfileRow>
        </Info>

      </Dialog>
    </Scrim>
  );
}
