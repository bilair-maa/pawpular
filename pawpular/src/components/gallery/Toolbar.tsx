import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { animalTypePluralLabels, type AnimalType, ANIMAL_TYPES } from '../../utils/animalType';
import type { SortOption } from '../../utils/filterPets';

export type { SortOption } from '../../utils/filterPets';

// Full sort option names shown inside the dropdown
const SORT_LABELS: Record<SortOption, string> = {
  'date-newest': 'Newest first',
  'date-oldest': 'Oldest first',
  'name-asc':    'Name A → Z',
  'name-desc':   'Name Z → A',
};

// Shorter versions shown on the button itself to save space
const SORT_SHORT: Record<SortOption, string> = {
  'date-newest': 'Newest',
  'date-oldest': 'Oldest',
  'name-asc':    'A → Z',
  'name-desc':   'Z → A',
};

// ── animation ─────────────────────────────────────────────────────────────────

const dropIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(-6px); }
  to   { opacity: 1; transform: none; }
`;

// ── shared dropdown primitives ────────────────────────────────────────────────

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => `${theme.shadows.popover} ${theme.colors.shadowStrong}`};
  padding: ${({ theme }) => theme.spacing.sm};
  animation: ${dropIn} 0.18s cubic-bezier(.34, 1.56, .64, 1);
  transform-origin: top right;
`;

const PopoverItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $active }) => $active ? theme.colors.primarySoft : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textMuted};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; color: ${({ theme }) => theme.colors.text}; }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: calc(-1 * ${({ theme }) => theme.focus.width}); border-radius: ${({ theme }) => theme.radii.sm}; }

  svg {
    width: ${({ theme }) => theme.icons.sm};
    height: ${({ theme }) => theme.icons.sm};
    flex-shrink: 0;
  }
`;

const PopoverCount = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
`;

const PopoverDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 4px 6px;
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 59;
`;

// ── toolbar layout ─────────────────────────────────────────────────────────────

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const SearchLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1 1 220px;
  min-width: 180px;
  color: ${({ theme }) => theme.colors.textSubtle};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 12px;
  box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadow}`};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    flex-shrink: 0;
  }
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;

  &::placeholder { color: ${({ theme }) => theme.colors.textSubtle}; }
`;

const ControlBtn = styled.button<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 11px;
  background: ${({ theme, $active }) => $active ? theme.colors.primarySoft : theme.colors.surface};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textMuted};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  white-space: nowrap;
  box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadow}`};
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;

  &:hover { color: ${({ theme }) => theme.colors.text}; border-color: ${({ theme }) => theme.colors.borderStrong}; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: ${({ theme }) => theme.focus.offset}; }

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    flex-shrink: 0;
  }

  svg:last-child {
    width: ${({ theme }) => theme.icons.xs};
    height: ${({ theme }) => theme.icons.xs};
  }
`;

const Badge = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
`;

const ClearFilterItem = styled(PopoverItem)`
  color: ${({ theme }) => theme.colors.favorite};
  font-weight: 700;
`;

const Wrap = styled.div`position: relative;`;

// ── sort dropdown ─────────────────────────────────────────────────────────────

interface SortDropdownProps {
  value: SortOption;
  onChange: (opt: SortOption) => void;
}

// Dropdown for choosing how to sort the gallery
function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Wrap>
      {open && <Scrim onClick={() => { setOpen(false); triggerRef.current?.focus(); }} />}
      <ControlBtn ref={triggerRef} type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        {SORT_SHORT[value]}
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </ControlBtn>
      {open && (
        <Popover role="menu" aria-label="Sort order">
          {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
            <PopoverItem
              key={opt}
              type="button"
              role="menuitemradio"
              $active={value === opt}
              aria-checked={value === opt}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {value === opt && (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {SORT_LABELS[opt]}
            </PopoverItem>
          ))}
        </Popover>
      )}
    </Wrap>
  );
}

// ── filter dropdown ───────────────────────────────────────────────────────────


interface FilterDropdownProps {
  activeFilters: Set<AnimalType>;
  onToggle: (type: AnimalType) => void;
  onClear: () => void;
  animalCounts: Partial<Record<AnimalType, number>>;
}

// Multi-select dropdown for filtering by animal type
function FilterDropdown({ activeFilters, onToggle, onClear, animalCounts }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const count = activeFilters.size;
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Wrap>
      {open && <Scrim onClick={() => { setOpen(false); triggerRef.current?.focus(); }} />}
      <ControlBtn
        ref={triggerRef}
        type="button"
        $active={count > 0}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={count > 0 ? `Filter: ${count} active` : 'Filter by animal type'}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
        {count > 0 && <Badge>{count}</Badge>}
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </ControlBtn>
      {open && (
        <Popover role="dialog" aria-label="Filter by animal type">
          {ANIMAL_TYPES.filter(t => (animalCounts[t] ?? 0) > 0).map(type => {
            const checked = activeFilters.has(type);
            return (
              <PopoverItem
                key={type}
                type="button"
                $active={checked}
                aria-pressed={checked}
                onClick={() => onToggle(type)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24"
                  fill={checked ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  {checked && <polyline points="7 12 10.5 15.5 17 9" stroke="currentColor" strokeWidth="2.4" fill="none" />}
                </svg>
                {animalTypePluralLabels[type]}
                <PopoverCount>{animalCounts[type]}</PopoverCount>
              </PopoverItem>
            );
          })}
          {count > 0 && (
            <>
              <PopoverDivider />
              <ClearFilterItem type="button" onClick={() => { onClear(); setOpen(false); }}>
                Clear filters
              </ClearFilterItem>
            </>
          )}
        </Popover>
      )}
    </Wrap>
  );
}

// ── main toolbar ──────────────────────────────────────────────────────────────

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  activeFilters: Set<AnimalType>;
  onToggleFilter: (type: AnimalType) => void;
  onClearFilters: () => void;
  animalCounts: Partial<Record<AnimalType, number>>;
}

// Search, sort, and filter controls for the gallery page
export function Toolbar({
  searchQuery, onSearchChange,
  sortOption, onSortChange,
  activeFilters, onToggleFilter, onClearFilters,
  animalCounts,
}: ToolbarProps) {
  return (
    <Row>
      <SearchLabel htmlFor="pet-search">
        <VisuallyHidden>Search pets</VisuallyHidden>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <SearchInput
          id="pet-search"
          type="search"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name or description…"
        />
      </SearchLabel>

      <SortDropdown value={sortOption} onChange={onSortChange} />

      <FilterDropdown
        activeFilters={activeFilters}
        onToggle={onToggleFilter}
        onClear={onClearFilters}
        animalCounts={animalCounts}
      />
    </Row>
  );
}
