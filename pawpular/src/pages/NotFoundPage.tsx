import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.display};
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HomeLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.width} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.offset};
  }
`;

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found — Pawpular';
  }, []);

  return (
    <Page>
      <Title>Page not found</Title>
      <Text>The page you are looking for does not exist.</Text>
      <HomeLink to="/gallery">Return to gallery</HomeLink>
    </Page>
  );
}
