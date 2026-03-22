import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

interface EmptyStateProps {
  message?: string;
}

// Centered message shown when a list loads successfully but has nothing in it
export function EmptyState({ message = 'No pets found.' }: EmptyStateProps) {
  return <Wrapper>{message}</Wrapper>;
}
