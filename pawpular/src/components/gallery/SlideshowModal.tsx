import { useEffect, useMemo, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Shuffle,
  Subtitles,
  Filter,
  X,
  Timer,
  Music2,
  Palette,
  Maximize2,
  Minimize2,
  ExternalLink,
  Check,
} from 'lucide-react';
import { getAnimalType, animalTypePluralLabels, type AnimalType, ANIMAL_TYPES } from '../../utils/animalType';
import type { Pet } from '../../types/pet';

// ─── Types ────────────────────────────────────────────────────────────────────

type BgStyle = 'dark' | 'midnight' | 'forest' | 'blush' | 'blur' | 'amber' | 'ocean';
type ActivePopover = 'speed' | 'music' | 'bg' | 'filter' | null;

// Background choices for the slideshow screen
const BG_OPTIONS: { id: BgStyle; label: string; swatch: string; bg: string }[] = [
  { id: 'dark',     label: 'Dark',     swatch: 'oklch(0.12 0.02 45)',  bg: 'oklch(0.08 0.02 45)' },
  { id: 'midnight', label: 'Midnight', swatch: 'oklch(0.14 0.08 260)', bg: 'oklch(0.10 0.07 260)' },
  { id: 'forest',   label: 'Forest',   swatch: 'oklch(0.14 0.07 150)', bg: 'oklch(0.10 0.06 150)' },
  { id: 'blush',    label: 'Blush',    swatch: 'oklch(0.16 0.07 10)',  bg: 'oklch(0.12 0.06 10)'  },
  { id: 'blur',     label: 'Photo',    swatch: 'oklch(0.40 0.00 0 / 0.5)', bg: 'oklch(0.08 0.02 45)' },
  { id: 'amber',    label: 'Amber',    swatch: 'oklch(0.16 0.09 60)',       bg: 'oklch(0.11 0.07 55)'  },
  { id: 'ocean',    label: 'Ocean',    swatch: 'oklch(0.15 0.08 220)',      bg: 'oklch(0.10 0.07 220)' },
];

// Delay options for auto-advancing slides
const SPEEDS = [
  { label: 'Leisurely', hint: '6 sec', ms: 6000 },
  { label: 'Normal',    hint: '4 sec', ms: 4000 },
  { label: 'Quick',     hint: '2 sec', ms: 2000 },
] as const;

// External music services opened in a new tab
const MUSIC_LINKS = [
  { label: 'Spotify',       url: 'https://open.spotify.com',    color: '#1ed760' },
  { label: 'YouTube Music', url: 'https://music.youtube.com',   color: '#ff0033' },
  { label: 'Apple Music',   url: 'https://music.apple.com',     color: '#fc3c44' },
] as const;


// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(1.025); }
  to   { opacity: 1; transform: scale(1); }
`;

const progressAnim = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

const captionSlide = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popUp = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Outer shell ──────────────────────────────────────────────────────────────

const Scrim = styled.div<{ $bg: string }>`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: ${({ $bg }) => $bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

// Blurred photo background layer
const BlurBg = styled.img`
  position: absolute;
  inset: -30px;
  width: calc(100% + 60px);
  height: calc(100% + 60px);
  object-fit: cover;
  filter: blur(28px) brightness(0.35) saturate(1.4);
  z-index: 0;
  pointer-events: none;
`;

// ─── Top chrome ───────────────────────────────────────────────────────────────

const ProgressTrack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: oklch(1 0 0 / 0.12);
  z-index: 10;
`;

const ProgressFill = styled.div<{ $speed: number; $playing: boolean }>`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  transform-origin: left;
  animation: ${progressAnim} ${({ $speed }) => $speed}ms linear;
  animation-play-state: ${({ $playing }) => ($playing ? 'running' : 'paused')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    width: 100%;
  }
`;

const TopLeft = styled.div`
  position: absolute;
  top: 14px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  z-index: 10;
`;

const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 10;
`;

const ChromeBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: oklch(1 0 0 / 0.5);
  background: oklch(1 0 0 / 0.07);
  border: 1px solid oklch(1 0 0 / 0.10);
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  svg { width: 15px; height: 15px; stroke-width: 2.2; }

  &:hover { color: oklch(1 0 0 / 0.9); background: oklch(1 0 0 / 0.14); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const Counter = styled.span`
  color: oklch(1 0 0 / 0.5);
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  letter-spacing: 0.06em;
`;

// ─── Content stack (image + caption anchored together) ────────────────────────

const ContentStack = styled.div`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SlideImage = styled.img`
  max-width: min(94vw, 1080px);
  max-height: 80vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 32px 80px -16px oklch(0 0 0 / 0.65);
  display: block;
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 640px) {
    max-height: 52vh;
  }
`;

// ─── Caption (below image, frosted glass) ─────────────────────────────────────

const CaptionBar = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: min(88%, 560px);
  background: oklch(0.10 0.02 45 / 0.82);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  border: 1px solid oklch(1 0 0 / 0.10);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 10px 16px;
  animation: ${captionSlide} 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 640px) {
    position: static;
    transform: none;
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const CaptionName = styled.p`
  color: oklch(1 0 0 / 0.95);
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
`;

const CaptionDesc = styled.p`
  color: oklch(1 0 0 / 0.65);
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// ─── HUD ─────────────────────────────────────────────────────────────────────

const Hud = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  background: oklch(0.13 0.02 45 / 0.82);
  backdrop-filter: blur(22px) saturate(1.5);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  border: 1px solid oklch(1 0 0 / 0.10);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 8px 14px;
  white-space: nowrap;
`;

const HudDivider = styled.div`
  width: 1px;
  height: 18px;
  background: oklch(1 0 0 / 0.13);
  flex-shrink: 0;
  margin: 0 2px;
`;

const HudBtn = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'oklch(1 0 0 / 0.95)' : 'oklch(1 0 0 / 0.48)')};
  background: ${({ $active }) => ($active ? 'oklch(0.645 0.155 45 / 0.3)' : 'transparent')};
  transition: color 0.15s, background 0.15s, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg { width: 18px; height: 18px; stroke-width: 2.2; }

  &:hover {
    color: oklch(1 0 0 / 0.95);
    background: oklch(1 0 0 / 0.09);
    transform: scale(1.08);
  }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const PlayBtn = styled(HudBtn)`
  width: 44px;
  height: 44px;
  color: oklch(1 0 0 / 0.95);
  background: ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.08);
  }
`;

// ─── Popovers (shared shell) ──────────────────────────────────────────────────

const Popover = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: oklch(0.13 0.02 45 / 0.94);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid oklch(1 0 0 / 0.12);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${popUp} 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  z-index: 20;
  min-width: 180px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// Wrapper gives popovers a positioning anchor relative to the HUD button
const HudBtnWrap = styled.div`
  position: relative;
  display: flex;
`;

const PopoverTitle = styled.p`
  color: oklch(1 0 0 / 0.4);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

// ─── Speed popover rows ───────────────────────────────────────────────────────

const SpeedRow = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  color: ${({ $active }) => ($active ? 'oklch(1 0 0 / 0.95)' : 'oklch(1 0 0 / 0.5)')};
  background: ${({ $active }) => ($active ? 'oklch(0.645 0.155 45 / 0.25)' : 'transparent')};
  text-align: left;
  transition: color 0.15s, background 0.15s;

  &:hover { color: oklch(1 0 0 / 0.9); background: oklch(1 0 0 / 0.09); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;


const SpeedHint = styled.span`
  color: oklch(1 0 0 / 0.3);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-left: auto;
`;

const SpeedCheck = styled(Check)`
  width: 14px;
  height: 14px;
  stroke-width: 3;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

// ─── Music popover ────────────────────────────────────────────────────────────

const MusicPopover = styled(Popover)`
  min-width: 220px;
  left: auto;
  right: 0;
  transform: none;
`;

const MusicNote = styled.p`
  color: oklch(1 0 0 / 0.35);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  line-height: 1.5;
  margin-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid oklch(1 0 0 / 0.08);
  padding-top: ${({ theme }) => theme.spacing.sm};
`;

const MusicBtn = styled.a<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  text-decoration: none;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  color: oklch(1 0 0 / 0.75);
  background: transparent;
  transition: color 0.15s, background 0.15s;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
  }

  svg { width: 13px; height: 13px; stroke-width: 2; margin-left: auto; opacity: 0.5; }

  &:hover { color: oklch(1 0 0 / 0.95); background: oklch(1 0 0 / 0.08); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

// ─── Background popover ───────────────────────────────────────────────────────

const BgPopover = styled(Popover)`
  left: auto;
  right: 0;
  transform: none;
  min-width: 160px;
`;

const SwatchRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Swatch = styled.button<{ $color: string; $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2.5px solid ${({ $active }) => ($active ? 'oklch(0.645 0.155 45)' : 'oklch(1 0 0 / 0.15)')};
  cursor: pointer;
  position: relative;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s;

  &:hover { transform: scale(1.15); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const SwatchLabel = styled.p`
  color: oklch(1 0 0 / 0.4);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  margin-top: 8px;
`;

// ─── Filter panel (side panel) ────────────────────────────────────────────────

const filterPanelSlide = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const FilterPanel = styled.div`
  position: absolute;
  right: 20px;
  top: 56px;
  bottom: 100px;
  width: 178px;
  z-index: 10;
  background: oklch(0.13 0.02 45 / 0.88);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid oklch(1 0 0 / 0.10);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow-y: auto;
  animation: ${filterPanelSlide} 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const FilterTitle = styled.p`
  color: oklch(1 0 0 / 0.4);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 7px 10px;
  border: 1px solid ${({ $active }) => ($active ? 'oklch(0.645 0.155 45 / 0.55)' : 'oklch(1 0 0 / 0.08)')};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  text-align: left;
  color: ${({ $active }) => ($active ? 'oklch(1 0 0 / 0.95)' : 'oklch(1 0 0 / 0.48)')};
  background: ${({ $active }) => ($active ? 'oklch(0.645 0.155 45 / 0.22)' : 'transparent')};
  transition: color 0.15s, background 0.15s, border-color 0.15s;

  &:hover { color: oklch(1 0 0 / 0.9); border-color: oklch(1 0 0 / 0.25); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

const ClearFiltersBtn = styled.button`
  margin-top: auto;
  padding: 6px 10px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primarySoft};
  transition: opacity 0.15s;

  &:hover { opacity: 0.8; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface SlideshowModalProps {
  pets: Pet[];
  onClose: () => void;
}

// Full-screen, auto-playing photo viewer with filters and display controls
export function SlideshowModal({ pets, onClose }: SlideshowModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCaption, setShowCaption] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<AnimalType>>(new Set());
  const [speed, setSpeed] = useState(4000);
  const [bgStyle, setBgStyle] = useState<BgStyle>('dark');
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const scrimRef = useFocusTrap<HTMLDivElement>(true);

  const bg = BG_OPTIONS.find(o => o.id === bgStyle)!;

  // Pets currently eligible for the slideshow after animal filters
  const filteredPets = useMemo(() => {
    if (activeFilters.size === 0) return pets;
    return pets.filter(pet => activeFilters.has(getAnimalType(pet)));
  }, [pets, activeFilters]);

  // Builds a randomized order whenever shuffle is enabled or the filter set changes
  useEffect(() => {
    if (!isShuffled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledOrder([]);
      return;
    }
    const indices = filteredPets.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCurrentIndex(0);
  }, [isShuffled, filteredPets]);

  const displayPets =
    isShuffled && shuffledOrder.length === filteredPets.length
      ? shuffledOrder.map(i => filteredPets[i])
      : filteredPets;

  // Keeps the current index valid after filtering or shuffle changes
  const safeIndex = displayPets.length > 0 ? currentIndex % displayPets.length : 0;
  const currentPet = displayPets[safeIndex];

  function navigate(delta: number) {
    if (!displayPets.length) return;
    setCurrentIndex(i => (i + delta + displayPets.length) % displayPets.length);
    setProgressKey(k => k + 1);
  }

  // Advances to the next pet after the selected delay
  useEffect(() => {
    if (!isPlaying || displayPets.length <= 1) return;
    const id = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % displayPets.length);
      setProgressKey(k => k + 1);
    }, speed);
    return () => clearTimeout(id);
  }, [isPlaying, displayPets.length, speed, safeIndex]);

  // Tracks browser fullscreen state so the icon stays correct
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      scrimRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Keyboard shortcuts for common slideshow actions
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !document.fullscreenElement) { onClose(); return; }
      switch (e.key) {
        case 'ArrowRight': navigate(1); break;
        case 'ArrowLeft':  navigate(-1); break;
        case ' ': e.preventDefault(); setIsPlaying(p => !p); break;
        case 's': setIsShuffled(s => !s); break;
        case 'c': setShowCaption(c => !c); break;
        case 'f': setActivePopover(p => (p === 'filter' ? null : 'filter')); break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPets.length, onClose]);

  // Lock page scrolling while the slideshow modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function toggleFilter(type: AnimalType) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setCurrentIndex(0);
    setProgressKey(k => k + 1);
  }

  function togglePopover(name: ActivePopover) {
    setActivePopover(p => (p === name ? null : name));
  }

  if (!currentPet) return null;

  return createPortal(
    <Scrim
      ref={scrimRef}
      $bg={bg.bg}
      role="dialog"
      aria-label="Photo slideshow"
      aria-modal="true"
      onClick={() => setActivePopover(null)}
    >
      {/* Blurred photo background */}
      {bgStyle === 'blur' && (
        <BlurBg key={currentPet.id} src={currentPet.imageUrl} alt="" aria-hidden="true" />
      )}

      {/* Progress bar */}
      <ProgressTrack>
        <ProgressFill key={progressKey} $speed={speed} $playing={isPlaying} />
      </ProgressTrack>

      {/* Top-left: close */}
      <TopLeft>
        <ChromeBtn type="button" aria-label="Close slideshow" onClick={onClose}>
          <X aria-hidden="true" />
        </ChromeBtn>
      </TopLeft>

      {/* Top-right: counter + fullscreen */}
      <TopRight>
        <Counter aria-live="polite" aria-atomic="true">
          {safeIndex + 1} / {displayPets.length}
        </Counter>
        <ChromeBtn
          type="button"
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        </ChromeBtn>
      </TopRight>

      {/* Image + caption */}
      <ContentStack onClick={e => e.stopPropagation()}>
        <SlideImage
          key={currentPet.id}
          src={currentPet.imageUrl}
          alt={currentPet.title}
        />
        {showCaption && (
          <CaptionBar key={`caption-${currentPet.id}`} aria-live="polite">
            <CaptionName>{currentPet.title}</CaptionName>
            {currentPet.description && (
              <CaptionDesc>{currentPet.description}</CaptionDesc>
            )}
          </CaptionBar>
        )}
      </ContentStack>

      {/* HUD */}
      <Hud role="toolbar" aria-label="Slideshow controls" onClick={e => e.stopPropagation()}>
        {/* Nav + play */}
        <HudBtn type="button" aria-label="Previous photo" onClick={() => navigate(-1)}>
          <ChevronLeft aria-hidden="true" />
        </HudBtn>
        <PlayBtn
          type="button"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          aria-pressed={isPlaying}
          onClick={() => setIsPlaying(p => !p)}
        >
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </PlayBtn>
        <HudBtn type="button" aria-label="Next photo" onClick={() => navigate(1)}>
          <ChevronRight aria-hidden="true" />
        </HudBtn>

        <HudDivider />

        {/* Shuffle */}
        <HudBtn
          type="button"
          $active={isShuffled}
          aria-label="Toggle shuffle"
          aria-pressed={isShuffled}
          onClick={() => setIsShuffled(s => !s)}
        >
          <Shuffle aria-hidden="true" />
        </HudBtn>

        {/* Caption */}
        <HudBtn
          type="button"
          $active={showCaption}
          aria-label="Toggle caption"
          aria-pressed={showCaption}
          onClick={() => setShowCaption(c => !c)}
        >
          <Subtitles aria-hidden="true" />
        </HudBtn>

        {/* Filter */}
        <HudBtn
          type="button"
          $active={activePopover === 'filter' || activeFilters.size > 0}
          aria-label="Filter by animal type"
          aria-expanded={activePopover === 'filter'}
          onClick={() => togglePopover('filter')}
        >
          <Filter aria-hidden="true" />
        </HudBtn>

        <HudDivider />

        {/* Speed — icon opens popover */}
        <HudBtnWrap>
          <HudBtn
            type="button"
            $active={activePopover === 'speed'}
            aria-label="Change slideshow speed"
            aria-expanded={activePopover === 'speed'}
            onClick={e => { e.stopPropagation(); togglePopover('speed'); }}
          >
            <Timer aria-hidden="true" />
          </HudBtn>
          {activePopover === 'speed' && (
            <Popover onClick={e => e.stopPropagation()}>
              <PopoverTitle>Speed</PopoverTitle>
              {SPEEDS.map(s => (
                <SpeedRow
                  key={s.ms}
                  type="button"
                  $active={speed === s.ms}
                  onClick={() => { setSpeed(s.ms); setProgressKey(k => k + 1); setActivePopover(null); }}
                >
                  {s.label}
                  <SpeedHint>{s.hint}</SpeedHint>
                  {speed === s.ms && <SpeedCheck aria-hidden="true" />}
                </SpeedRow>
              ))}
            </Popover>
          )}
        </HudBtnWrap>

        {/* Music */}
        <HudBtnWrap>
          <HudBtn
            type="button"
            $active={activePopover === 'music'}
            aria-label="Music options"
            aria-expanded={activePopover === 'music'}
            onClick={e => { e.stopPropagation(); togglePopover('music'); }}
          >
            <Music2 aria-hidden="true" />
          </HudBtn>
          {activePopover === 'music' && (
            <MusicPopover onClick={e => e.stopPropagation()}>
              <PopoverTitle>Soundtrack</PopoverTitle>
              {MUSIC_LINKS.map(m => (
                <MusicBtn
                  key={m.label}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  $color={m.color}
                  aria-label={`Open ${m.label} in a new tab`}
                >
                  {m.label}
                  <ExternalLink aria-hidden="true" />
                </MusicBtn>
              ))}
              <MusicNote>
                Open a playlist in another tab — your music plays alongside the slideshow.
              </MusicNote>
            </MusicPopover>
          )}
        </HudBtnWrap>

        {/* Background */}
        <HudBtnWrap>
          <HudBtn
            type="button"
            $active={activePopover === 'bg'}
            aria-label="Change background"
            aria-expanded={activePopover === 'bg'}
            onClick={e => { e.stopPropagation(); togglePopover('bg'); }}
          >
            <Palette aria-hidden="true" />
          </HudBtn>
          {activePopover === 'bg' && (
            <BgPopover onClick={e => e.stopPropagation()}>
              <PopoverTitle>Background</PopoverTitle>
              <SwatchRow role="group" aria-label="Choose a background">
                {BG_OPTIONS.map(opt => (
                  <Swatch
                    key={opt.id}
                    type="button"
                    $color={opt.swatch}
                    $active={bgStyle === opt.id}
                    aria-pressed={bgStyle === opt.id}
                    aria-label={opt.label}
                    title={opt.label}
                    onClick={() => { setBgStyle(opt.id); setActivePopover(null); }}
                  />
                ))}
              </SwatchRow>
              <SwatchLabel>
                {BG_OPTIONS.find(o => o.id === bgStyle)?.label}
              </SwatchLabel>
            </BgPopover>
          )}
        </HudBtnWrap>
      </Hud>

      {/* Filter side panel */}
      {activePopover === 'filter' && (
        <FilterPanel
          role="region"
          aria-label="Filter by animal type"
          onClick={e => e.stopPropagation()}
        >
          <FilterTitle>Filter</FilterTitle>
          {ANIMAL_TYPES.map(type => (
            <FilterChip
              key={type}
              type="button"
              $active={activeFilters.has(type)}
              aria-pressed={activeFilters.has(type)}
              onClick={() => toggleFilter(type)}
            >
              {animalTypePluralLabels[type]}
            </FilterChip>
          ))}
          {activeFilters.size > 0 && (
            <ClearFiltersBtn
              type="button"
              onClick={() => {
                setActiveFilters(new Set());
                setCurrentIndex(0);
                setProgressKey(k => k + 1);
              }}
            >
              Clear filters
            </ClearFiltersBtn>
          )}
        </FilterPanel>
      )}
    </Scrim>,
    document.body,
  );
}
