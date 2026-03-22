import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { UserPlus, UserCheck } from 'lucide-react';
import { useFollow } from '../../context/useFollow';
import { useUser } from '../../context/useUser';
import { useLoginModal } from '../../context/LoginModalContext';

// The bounce animation that plays when you follow or unfollow
const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.32); }
  70%  { transform: scale(0.88); }
  100% { transform: scale(1); }
`;

// $inCard: when true, hides until the parent article is hovered (matches PetCard behaviour)
const Btn = styled.button<{ $active: boolean; $inCard: boolean; $popping: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 0;
  backdrop-filter: blur(6px);
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;

  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  background-color: ${({ theme }) => theme.colors.whiteOverlay};
  border-radius: ${({ theme }) => theme.radii.circle};

  animation: ${({ $popping }) =>
    $popping
      ? css`${pop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`
      : 'none'};

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    stroke-width: 2;
  }

  &:hover {
    transform: scale(1.08);
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }

  /* Card-overlay variant: hidden until hovered; stays hidden once following (Instagram-style) */
  ${({ $inCard, $active, theme }) =>
    $inCard &&
    css`
      width: ${theme.controls.compact};
      height: ${theme.controls.compact};
      box-shadow: ${theme.shadows.control} ${theme.colors.shadowStrong};
      font-size: ${theme.fontSizes.md};
      font-weight: 900;
      line-height: 1;
      opacity: 0;
      transform: scale(0.74);
      pointer-events: ${$active ? 'none' : 'auto'};

      ${!$active && `
        article:hover &,
        article:focus-within & {
          opacity: 1;
          transform: scale(1);
        }
      `}
    `}

  /* Standalone variant (e.g. on crew pages) */
  ${({ $inCard, $active, theme }) =>
    !$inCard &&
    css`
      gap: 6px;
      padding: 0 ${theme.spacing.md};
      height: ${theme.controls.base};
      border-radius: ${theme.radii.sm};
      font: inherit;
      font-size: ${theme.fontSizes.sm};
      font-weight: 900;
      white-space: nowrap;
      border: 1px solid ${$active ? theme.colors.primary : theme.colors.border};

      &:hover {
        border-color: ${theme.colors.primary};
        background-color: ${theme.colors.primarySoft};
        transform: translateY(-1px);
      }
    `}
`;

interface FollowButtonProps {
  petId: string;
  petName: string;
  /** When true, renders as a compact overlay icon inside a PetCard badge row */
  inCard?: boolean;
}

// Follow/unfollow button — compact icon overlay on cards, full pill button elsewhere
export function FollowButton({ petId, petName, inCard = false }: FollowButtonProps) {
  const { isFollowingPet, toggleFollowPet } = useFollow();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  const [popping, setPopping] = useState(false);

  const following = isFollowingPet(petId);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin('register');
      return;
    }
    toggleFollowPet(petId);
    setPopping(true);
  }

  return (
    <Btn
      type="button"
      $active={following}
      $inCard={inCard}
      $popping={popping}
      aria-pressed={following}
      aria-label={`${following ? 'Unfollow' : 'Follow'} ${petName}`}
      onClick={handleClick}
      onAnimationEnd={() => setPopping(false)}
    >
      {following ? (
        <UserCheck aria-hidden="true" />
      ) : (
        <UserPlus aria-hidden="true" />
      )}
      {!inCard && (following ? 'Following' : 'Follow')}
    </Btn>
  );
}
