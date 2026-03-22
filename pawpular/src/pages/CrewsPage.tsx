import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserPlus, UserCheck } from 'lucide-react';
import { useCrews } from '../hooks/useCrews';
import { useFollow } from '../context/useFollow';
import { useUser } from '../context/useUser';
import { useLoginModal } from '../context/LoginModalContext';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import type { Crew } from '../utils/buildCrews';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.wide};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 40px) clamp(16px, 4vw, 40px) 80px;
`;

const Hero = styled.header`
  max-width: 580px;
  margin-bottom: clamp(24px, 3vw, 40px);
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(26px, 3.5vw, 36px);
  line-height: 1.05;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  line-height: 1.55;
  margin-top: 8px;
`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────

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

// ─── Grid ─────────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
  gap: clamp(12px, 2vw, 24px);
`;

// ─── Crew Card ────────────────────────────────────────────────────────────────

const Card = styled.article<{ $delay: number }>`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeUp} 0.45s cubic-bezier(0.34, 1.1, 0.64, 1) both;
  animation-delay: ${({ $delay }) => $delay}ms;
  transition: box-shadow 0.28s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    box-shadow: 0 10px 36px -8px ${({ theme }) => theme.colors.shadow};
    transform: translateY(-3px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// Invisible stretched link covers the entire card
const CardLink = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: ${({ theme }) => theme.radii.xl};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  border: 2.5px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px -3px ${({ theme }) => theme.colors.shadowStrong};
  margin-left: -12px;

  &:first-child {
    margin-left: 0;
  }
`;

const CrewMeta = styled.div`
  flex: 1;
`;

const CrewName = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  line-height: 1.2;
`;

const CrewTagline = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  margin-top: 2px;
`;

const SinceBadge = styled.span`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
`;

// Join/Joined button — absolutely pinned to top-right of the card
const FollowCrewBtn = styled.button<{ $following: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: ${({ theme }) => theme.controls.compact};
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ $following, theme }) => ($following ? theme.colors.primary : theme.colors.border)};
  background: ${({ $following, theme }) => ($following ? theme.colors.primarySoft : theme.colors.surface)};
  color: ${({ $following, theme }) => ($following ? theme.colors.primary : theme.colors.textMuted)};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg { width: ${({ theme }) => theme.icons.sm}; height: ${({ theme }) => theme.icons.sm}; flex-shrink: 0; }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;

// ─── Following tab empty state ────────────────────────────────────────────────

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-weight: 700;
`;

// ─── Crew card component ──────────────────────────────────────────────────────

function CrewCard({ crew, delay }: { crew: Crew; delay: number }) {
  const { isFollowingCrew, toggleFollowCrew } = useFollow();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();
  const following = isFollowingCrew(crew.id);

  function handleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { openLogin('register'); return; }
    toggleFollowCrew(crew.id);
  }

  return (
    <Card $delay={delay}>
      <CardLink to={`/crews/${crew.id}`} aria-label={`View ${crew.name}`} />
      <FollowCrewBtn
        type="button"
        $following={following}
        aria-pressed={following}
        aria-label={following ? `Leave ${crew.name}` : `Join ${crew.name}`}
        onClick={handleFollow}
      >
        {following
          ? <><UserCheck aria-hidden="true" /> Joined</>
          : <><UserPlus aria-hidden="true" /> Join</>}
      </FollowCrewBtn>
      <AvatarGroup aria-label={`${crew.name} members`}>
        {crew.members.map(m => (
          <Avatar key={m.id} src={m.imageUrl} alt={m.title} title={m.title} />
        ))}
      </AvatarGroup>
      <CrewMeta>
        <CrewName>{crew.name}</CrewName>
        <CrewTagline>{crew.tagline}</CrewTagline>
      </CrewMeta>
      <SinceBadge>Since {crew.since.match(/\d{4}/)?.[0]}</SinceBadge>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CrewsPage() {
  const { crews, loading, error, retry } = useCrews();

  useEffect(() => {
    document.title = 'Crews — Pawpular';
  }, []);
  const { followedCrewIds } = useFollow();
  const { isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;

  // The Following tab filters the generated crews by saved crew ids
  const followedCrews = crews.filter(c => followedCrewIds.has(c.id));
  const displayCrews = activeTab === 'following' ? followedCrews : crews;

  return (
    <Page>
      <Hero>
        <Eyebrow>Crews</Eyebrow>
        <Title>Meet the Crews</Title>
        <Subtitle>
          Every pet has their people. Explore the friend groups, follow the ones you love, and
          watch their stories unfold.
        </Subtitle>
      </Hero>

      <TabRow>
        <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All Crews
        </Tab>
        {isAuthenticated && (
          <Tab $active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
            Following {followedCrews.length > 0 && `(${followedCrews.length})`}
          </Tab>
        )}
      </TabRow>

      {displayCrews.length === 0 ? (
        <Empty>
          {activeTab === 'following'
            ? 'You haven\'t followed any crews yet. Explore them all and find your favourites!'
            : 'No crews found.'}
        </Empty>
      ) : (
        <Grid>
          {displayCrews.map((crew, i) => (
            <CrewCard key={crew.id} crew={crew} delay={Math.min(i * 40, 300)} />
          ))}
        </Grid>
      )}
    </Page>
  );
}
