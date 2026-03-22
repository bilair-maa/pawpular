import styled from 'styled-components';
import { Check, X, Download } from 'lucide-react';
import { useSelection } from '../../context/useSelection';
import { formatBytes } from '../../utils/formatBytes';

const Shell = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${({ theme }) => theme.spacing.lg};
  z-index: 130;
  display: flex;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  pointer-events: none;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: min(720px, calc(100vw - 32px));
  pointer-events: auto;
  color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => `${theme.shadows.popover} ${theme.colors.shadowStrong}`};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    padding-left: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const Info = styled.span`
  color: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 800;
  white-space: nowrap;
`;

const Sep = styled.span`
  color: currentColor;
  opacity: 0.4;
  user-select: none;
`;

const Spacer = styled.div`flex: 1;`;

const BtnLabel = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const BarBtn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  white-space: nowrap;
  transition: transform 0.16s cubic-bezier(.34, 1.56, .64, 1), background-color 0.15s, opacity 0.15s;

  ${({ theme, $variant }) => $variant === 'primary' ? `
    color: ${theme.colors.surface};
    background-color: ${theme.colors.primary};
    &:hover:not(:disabled) { background-color: ${theme.colors.primaryHover}; transform: translateY(-1px); }
  ` : `
    color: inherit;
    background-color: ${theme.colors.whiteOverlayMuted};
    &:hover:not(:disabled) { background-color: ${theme.colors.whiteOverlayHover}; transform: translateY(-1px); }
  `}

  &:active { transform: scale(0.95); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: ${({ theme }) => theme.focus.offset}; }

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    stroke-width: 2.4;
    flex-shrink: 0;
  }
`;

interface SelectionBarProps {
  onDownload: () => void;
  onSelectAll: () => void;
  totalCount: number;
  isDownloading: boolean;
}

// Fixed bar at the bottom of the screen showing selected count, size, and download button
export function SelectionBar({ onDownload, onSelectAll, totalCount, isDownloading }: SelectionBarProps) {
  const { selectedCount, estimatedTotalBytes, clearSelection } = useSelection();

  if (selectedCount === 0) return null;

  return (
    <Shell role="status" aria-live="polite">
      <Bar>
        <Info>{selectedCount} selected</Info>
        <Sep aria-hidden="true">·</Sep>
        <Info>{formatBytes(estimatedTotalBytes)}</Info>
        <Spacer />
        {selectedCount < totalCount && (
          <BarBtn type="button" $variant="ghost" onClick={onSelectAll} aria-label="Select all photos">
            <Check aria-hidden="true" />
            <BtnLabel>Select all</BtnLabel>
          </BarBtn>
        )}
        <BarBtn
          type="button"
          $variant="ghost"
          aria-label="Clear all selected"
          onClick={clearSelection}
        >
          <X aria-hidden="true" />
          <BtnLabel>Clear</BtnLabel>
        </BarBtn>
        <BarBtn
          type="button"
          $variant="primary"
          onClick={onDownload}
          disabled={isDownloading}
          aria-label={isDownloading ? 'Downloading…' : 'Download selected photos'}
        >
          <Download aria-hidden="true" />
          <BtnLabel>{isDownloading ? 'Downloading…' : 'Download'}</BtnLabel>
        </BarBtn>
      </Bar>
    </Shell>
  );
}
