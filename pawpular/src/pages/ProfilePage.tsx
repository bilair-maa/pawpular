import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Spinner } from '../components/ui/Spinner';
import { useSavedPets } from '../context/useSavedPets';
import { useFollow } from '../context/useFollow';
import { useUser } from '../context/useUser';
import { usePets } from '../hooks/usePets';

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.narrow};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.display};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Summary = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button`
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  font: inherit;
  font-weight: 600;

  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatLink = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StatValue = styled.strong`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.title};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export function ProfilePage() {
  const { currentUser, logout } = useUser();

  useEffect(() => {
    document.title = 'Profile — Pawpular';
  }, []);
  const { pets, loading, error, retry } = usePets();
  const { favoritePetIds, downloadedPetIds } = useSavedPets();
  const { followedPetIds, followedCrewIds } = useFollow();
  const navigate = useNavigate();

  const counts = useMemo(() => ({
    favorites: pets.filter(pet => favoritePetIds.has(pet.id)).length,
    downloads: pets.filter(pet => downloadedPetIds.has(pet.id)).length,
    followedPets: followedPetIds.size,
    followedCrews: followedCrewIds.size,
  }), [pets, favoritePetIds, downloadedPetIds, followedPetIds, followedCrewIds]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={retry} />;

  return (
    <Page>
      <Header>
        <Title>{currentUser?.username}</Title>
        <Summary>Favorites and downloads are linked to this account.</Summary>
      </Header>

      <Section aria-labelledby="profile-settings-heading">
        <SectionTitle id="profile-settings-heading">Account</SectionTitle>
        <Summary>Signed in as {currentUser?.username}</Summary>
        <Button type="button" onClick={handleLogout}>Log Out</Button>
      </Section>

      <Section aria-labelledby="profile-history-heading">
        <SectionTitle id="profile-history-heading">History</SectionTitle>
        <Stats>
          <StatLink to="/favorites">
            <StatValue>{counts.favorites}</StatValue>
            <StatLabel>favorite pets</StatLabel>
          </StatLink>
          <StatLink to="/downloads">
            <StatValue>{counts.downloads}</StatValue>
            <StatLabel>downloaded pets</StatLabel>
          </StatLink>
          <StatLink to="/following">
            <StatValue>{counts.followedPets}</StatValue>
            <StatLabel>followed pets</StatLabel>
          </StatLink>
          <StatLink to="/crews">
            <StatValue>{counts.followedCrews}</StatValue>
            <StatLabel>followed crews</StatLabel>
          </StatLink>
        </Stats>
      </Section>
    </Page>
  );
}
