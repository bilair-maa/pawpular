import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { ArrowLeft, Users, Camera } from 'lucide-react';
import { useCrews } from '../hooks/useCrews';
import { useFollow } from '../context/useFollow';
import { useUser } from '../context/useUser';
import { useLoginModal } from '../context/LoginModalContext';
import { FollowButton } from '../components/gallery/FollowButton';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { hashString } from '../utils/buildCrews';
import type { Crew } from '../utils/buildCrews';
import type { Pet } from '../types/pet';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Activity timeline ────────────────────────────────────────────────────────

type ActivityTemplate = {
  text: (names: string[]) => string;
  foundational?: boolean;
};

// Two-pet timeline events shown on crew detail pages
const PAIR_TEMPLATES: ActivityTemplate[] = [
  { text: ([a, b]) => `${a} liked ${b}'s latest photo` },
  { text: ([a, b]) => `${a} and ${b} were spotted together at the park` },
  { text: ([a, b]) => `${b} gave ${a} a shoutout` },
  { text: ([a, b]) => `${a} went on a playdate with ${b}` },
  { text: ([a, b]) => `${b} saved ${a}'s photo to their favourites` },
  { text: ([a, b]) => `${a} and ${b} became friends`, foundational: true },
  { text: ([a, b]) => `${a} met ${b} for the very first time`, foundational: true },
];

// Extra timeline events used when a crew has three members
const TRIO_TEMPLATES: ActivityTemplate[] = [
  { text: ([a, b, c]) => `${a}, ${b} & ${c} had a group hangout` },
  { text: ([a, b, c]) => `${a} tagged ${b} and ${c} in a post` },
  { text: ([a, b, c]) => `${c} joined ${a} and ${b}'s crew`, foundational: true },
  { text: ([a, b, c]) => `The trio (${a}, ${b} & ${c}) went on a big adventure` },
  { text: ([a, b, c]) => `${a} sent ${b} and ${c} the funniest video` },
];

// Generates a stable fake activity timeline from the crew id
function generateActivities(crew: Crew) {
  const h = hashString(crew.id);
  const names = crew.members.map(m => m.title.trim().split(/\s+/)[0]);
  const isTrio = crew.members.length >= 3;
  const templates = isTrio ? [...PAIR_TEMPLATES, ...TRIO_TEMPLATES] : PAIR_TEMPLATES;

  const picked: ActivityTemplate[] = [];
  const usedIndices = new Set<number>();
  for (let i = 0; picked.length < 6 && i < 40; i++) {
    const idx = (h * (i + 1) + i * 7) % templates.length;
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      picked.push(templates[idx]);
    }
  }

  // Foundational events (first meeting, becoming friends) must always be the
  // oldest entries so the timeline reads in a sensible order.
  const sorted = [...picked].sort((a, b) => (a.foundational ? 1 : 0) - (b.foundational ? 1 : 0));

  const daysAgoBase = [1, 4, 9, 15, 22, 38];

  return sorted.map((tpl, i) => ({
    id: `act-${i}`,
    text: tpl.text(names),
    daysAgo: daysAgoBase[i],
  }));
}

function formatDaysAgo(days: number): string {
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return '1 month ago';
}

// ─── Styled components ────────────────────────────────────────────────────────

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.full};
  margin: 0 auto;
  padding: clamp(20px, 3vw, 40px) clamp(16px, 4vw, 40px) 80px;
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
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  transition: color 0.2s ease;

  svg { width: ${({ theme }) => theme.icons.sm}; height: ${({ theme }) => theme.icons.sm}; }

  &:hover { color: ${({ theme }) => theme.colors.text}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; border-radius: 2px; }
`;

const JoinBtn = styled.button<{ $joined: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $joined, theme }) => $joined ? theme.colors.primarySoft : theme.colors.primary};
  color: ${({ $joined, theme }) => $joined ? theme.colors.primary : theme.colors.surface};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg { width: ${({ theme }) => theme.icons.sm}; height: ${({ theme }) => theme.icons.sm}; }

  &:hover { transform: scale(1.04); box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadowStrong}`}; }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary}; outline-offset: ${({ theme }) => theme.focus.offset}; }
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  animation: ${fadeUp} 0.45s cubic-bezier(0.34, 1.1, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const AvatarRing = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HeroAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 20px -6px ${({ theme }) => theme.colors.shadowStrong};
  margin-left: -16px;

  &:first-child { margin-left: 0; }

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
  }
`;

const CrewName = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 700;
  line-height: 1.1;
`;

const CrewTagline = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const SinceBadge = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
`;



// ─── Page two-column layout ───────────────────────────────────────────────────

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: clamp(24px, 3vw, 48px);
  align-items: start;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 3vw, 40px);
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 3vw, 40px);
`;

// ─── Members ──────────────────────────────────────────────────────────────────

const Section = styled.section<{ $delay?: number; $flush?: boolean }>`
  margin-bottom: ${({ $flush }) => $flush ? 0 : 'clamp(28px, 4vw, 48px)'};
  animation: ${fadeUp} 0.45s cubic-bezier(0.34, 1.1, 0.64, 1) both;
  animation-delay: ${({ $delay }) => $delay ?? 100}ms;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const NotFoundText = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 700;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MemberCardWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: box-shadow 0.18s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    box-shadow: 0 4px 16px -6px ${({ theme }) => theme.colors.shadow};
    transform: translateY(-2px);
  }
`;

const MemberCardLink = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: ${({ theme }) => theme.radii.lg};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const MemberAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  object-position: center 18%;
  border: 2px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const MemberName = styled.span`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
`;

const MemberFollowWrap = styled.div`
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`;



// ─── Photo placeholders ───────────────────────────────────────────────────────

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
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

const PHOTO_PLACEHOLDERS = [0, 1, 2, 3];

// ─── Activity Timeline ────────────────────────────────────────────────────────

const Timeline = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TimelineItem = styled.li<{ $delay: number }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  animation: ${fadeUp} 0.4s cubic-bezier(0.34, 1.1, 0.64, 1) both;
  animation-delay: ${({ $delay }) => $delay}ms;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const TimelineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
  margin-top: 5px;
`;

const TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimelineText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  line-height: 1.45;
`;

const TimelineDate = styled.span`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
`;

// ─── Member tile ──────────────────────────────────────────────────────────────

function MemberTile({ pet }: { pet: Pet }) {
  return (
    <MemberCardWrap>
      <MemberCardLink to={`/pets/${pet.id}`} aria-label={`View ${pet.title}'s profile`} />
      <MemberAvatar src={pet.imageUrl} alt={pet.title} />
      <MemberName>{pet.title}</MemberName>
      <MemberFollowWrap>
        <FollowButton petId={pet.id} petName={pet.title} />
      </MemberFollowWrap>
    </MemberCardWrap>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function CrewHero({ crew }: { crew: Crew }) {
  return (
    <HeroSection>
      <AvatarRing>
        {crew.members.map(m => (
          <HeroAvatar key={m.id} src={m.imageUrl} alt={m.title} title={m.title} />
        ))}
      </AvatarRing>
      <div>
        <CrewName>{crew.name}</CrewName>
        <CrewTagline>{crew.tagline}</CrewTagline>
      </div>
      <SinceBadge>{crew.since}</SinceBadge>
    </HeroSection>
  );
}

export function CrewDetailPage() {
  const { crewId } = useParams<{ crewId: string }>();
  const { crews, loading, error, retry } = useCrews();
  const { isFollowingCrew, toggleFollowCrew } = useFollow();
  const { isAuthenticated } = useUser();
  const { openLogin } = useLoginModal();

  const crew = useMemo(
    () => (crewId ? crews.find(c => c.id === crewId) : undefined),
    [crews, crewId],
  );

  const activities = useMemo(
    () => (crew ? generateActivities(crew) : []),
    [crew],
  );

  const following = crew ? isFollowingCrew(crew.id) : false;

  useEffect(() => {
    document.title = crew ? `${crew.name} — Pawpular` : 'Pawpular';
  }, [crew?.name]);

  function handleJoin() {
    if (!isAuthenticated) { openLogin('register'); return; }
    if (crew) toggleFollowCrew(crew.id);
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (!crew) {
    return (
      <Page>
        <BackLink to="/crews">
          <ArrowLeft aria-hidden="true" /> Back to Crews
        </BackLink>
        <NotFoundText>Crew not found.</NotFoundText>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <BackLink to="/crews">
          <ArrowLeft aria-hidden="true" /> Back to Crews
        </BackLink>
        <JoinBtn
          type="button"
          $joined={following}
          aria-pressed={following}
          aria-label={following ? `Leave ${crew.name}` : `Join ${crew.name}`}
          onClick={handleJoin}
        >
          <Users aria-hidden="true" />
          {following ? 'Joined' : 'Join Crew'}
        </JoinBtn>
      </PageHeader>

      <TwoColumnLayout>
        <LeftColumn>
          <CrewHero crew={crew} />
          <Section aria-label="Crew photos" $delay={150} $flush>
            <SectionTitle>Photos</SectionTitle>
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
          </Section>
        </LeftColumn>

        <RightColumn>
          <Section aria-label="Crew members" $flush>
            <SectionTitle>Members</SectionTitle>
            <MembersList>
              {crew.members.map(pet => (
                <MemberTile key={pet.id} pet={pet} />
              ))}
            </MembersList>
          </Section>
          <Section aria-label="Activity timeline" $flush>
            <SectionTitle>Activity</SectionTitle>
            <Timeline>
              {activities.map((act, i) => (
                <TimelineItem key={act.id} $delay={i * 60}>
                  <TimelineDot aria-hidden="true" />
                  <TimelineContent>
                    <TimelineText>{act.text}</TimelineText>
                    <TimelineDate>{formatDaysAgo(act.daysAgo)}</TimelineDate>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Section>
        </RightColumn>
      </TwoColumnLayout>
    </Page>
  );
}
