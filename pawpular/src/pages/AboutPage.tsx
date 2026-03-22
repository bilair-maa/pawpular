import { useEffect } from 'react';
import styled from 'styled-components';
import { usePets } from '../hooks/usePets';
import { getAnimalType } from '../utils/animalType';

const fallbackImages = [
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=700&q=80',
];

const Page = styled.main`
  max-width: ${({ theme }) => theme.layout.full};
  margin: 0 auto;
  padding: clamp(24px, 4vw, 52px) clamp(16px, 4vw, 40px) 80px;
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  gap: clamp(42px, 7vw, 84px);
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

const Copy = styled.div`
  max-width: 560px;
`;

const HeroLogo = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
  margin-bottom: 18px;
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
  letter-spacing: 0.14em;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(44px, 6vw, 62px);
  letter-spacing: 0;
  line-height: 0.96;
  max-width: 620px;
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(1rem, 1.6vw, 1.12rem);
  font-weight: 700;
  line-height: 1.65;
  margin-top: 22px;
  max-width: 560px;
`;


const Mosaic = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 220px;
  gap: 12px;

  @media (max-width: 520px) {
    grid-auto-rows: 160px;
  }
`;

const MosaicImage = styled.img<{ $lift?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => `${theme.shadows.popover} ${theme.colors.shadowStrong}`};
  transform: ${({ $lift }) => ($lift ? 'translateY(-22px)' : 'none')};

  @media (max-width: 900px) {
    transform: none;
  }
`;

const Stats = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: clamp(32px, 4vw, 52px);

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  display: grid;
  place-items: center;
  min-height: 104px;
  padding: 18px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => `${theme.shadows.control} ${theme.colors.shadowStrong}`};
  text-align: center;
`;

const StatValue = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.primary};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: clamp(30px, 3vw, 38px);
  font-weight: 700;
  line-height: 0.95;
`;

const StatLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  margin-top: 10px;
`;

export function AboutPage() {
  const { pets } = usePets();

  useEffect(() => {
    document.title = 'About — Pawpular';
  }, []);
  // Use live pet photos when available, otherwise fall back to static examples
  const heroImages = pets.slice(0, 4).map(pet => pet.imageUrl);
  const images = heroImages.length === 4 ? heroImages : fallbackImages;
  const speciesCount = pets.length > 0 ? new Set(pets.map(getAnimalType)).size : 6;
  const friendCount = pets.length || 21;

  return (
    <Page>
      <Hero aria-labelledby="about-title">
        <Copy>
          <HeroLogo src="/logo.png" alt="Pawpular" />
          <Eyebrow>About Pawpular</Eyebrow>
          <Title id="about-title">A little gallery for very good company.</Title>
          <Intro>
            Pawpular is a cozy home for the internet&apos;s most charming animals, from majestic
            cats to playful dachshunds and bunnies who really loves cilantro. Browse, favorite,
            share, and download your favorites.
          </Intro>
        </Copy>
        <Mosaic aria-label="A Sample of Pawpular Pets">
          {images.map((image, index) => (
            <MosaicImage
              key={image}
              src={image}
              alt=""
              aria-hidden="true"
              $lift={index === 1}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </Mosaic>
      </Hero>

      <Stats aria-label="Pawpular by the Numbers">
        <StatCard>
          <div>
            <StatValue>{friendCount}</StatValue>
            <StatLabel>Besties</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <div>
            <StatValue>{speciesCount}</StatValue>
            <StatLabel>Species</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <div>
            <StatValue>&infin;</StatValue>
            <StatLabel>Belly Rubs Given</StatLabel>
          </div>
        </StatCard>
        <StatCard>
          <div>
            <StatValue>2am</StatValue>
            <StatLabel>Peak Zoomies</StatLabel>
          </div>
        </StatCard>
      </Stats>
    </Page>
  );
}
