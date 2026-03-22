import { useState, type FormEvent } from 'react';
import styled, { keyframes } from 'styled-components';
import { useUser } from '../../context/useUser';
import { type LoginMode } from '../../context/LoginModalContext';

const panelIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: none; }
`;

const Panel = styled.section`
  width: min(400px, 96vw);
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 24px 64px -20px ${({ theme }) => theme.colors.shadowStrong};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  animation: ${panelIn} 0.35s cubic-bezier(.34, 1.56, .64, 1);
`;

const MarkImage = styled.img`
  width: 52px;
  height: 52px;
  object-fit: contain;
  display: block;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.35;
  text-align: center;
  max-width: 30ch;
  margin: 6px auto 16px;
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TabButton = styled.button<{ $active: boolean }>`
  color: ${({ theme, $active }) => $active ? theme.colors.surface : theme.colors.textMuted};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.surface};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  min-height: ${({ theme }) => theme.controls.base};
  padding: 0 ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  transition: transform 0.16s cubic-bezier(.34, 1.56, .64, 1), border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    transform: translateY(-1px);
    background-color: ${({ theme, $active }) => $active ? theme.colors.primaryHover : theme.colors.surfaceAlt};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 900;
`;

const Input = styled.input`
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  height: ${({ theme }) => theme.controls.large};
  padding: 0 14px;
  font: inherit;
  font-weight: 700;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover { border-color: ${({ theme }) => theme.colors.borderStrong}; }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const SubmitButton = styled.button`
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  min-height: ${({ theme }) => theme.controls.large};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  margin-top: ${({ theme }) => theme.spacing.xs};
  transition: transform 0.16s cubic-bezier(.34, 1.56, .64, 1), background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorBg};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  margin: ${({ theme }) => theme.spacing.xs} 0;

  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const Footer = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const FooterButton = styled.button`
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: ${({ theme }) => theme.spacing.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

interface LoginPanelProps {
  onSuccess: () => void;
  initialMode?: LoginMode;
}

// Login/register form used inside LoginModal
export function LoginPanel({ onSuccess, initialMode = 'login' }: LoginPanelProps) {
  const { login, register } = useUser();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const errorId = 'login-error';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Calls the matching auth action based on the active tab
    const success = await (mode === 'login' ? login(username, password) : register(username, password));
    if (!success) {
      setError(mode === 'login'
        ? 'Username or password is incorrect.'
        : 'Choose a username and password that are not already in use.');
      return;
    }
    onSuccess();
  }

  return (
    <Panel aria-labelledby="login-heading">
      <MarkImage src="/logo.png" alt="" aria-hidden="true" />
      <Title id="login-heading">
        {mode === 'login' ? 'Welcome to Pawpular' : 'Create your Pawpular account'}
      </Title>
      <Subtitle>
        {mode === 'login'
          ? 'Sign in to save favorites and keep your download history.'
          : 'Save favorites, collect downloads, and make the gallery yours.'}
      </Subtitle>
      <Tabs aria-label="Login options">
        <TabButton type="button" $active={mode === 'login'} aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Log In</TabButton>
        <TabButton type="button" $active={mode === 'register'} aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Sign Up</TabButton>
      </Tabs>
      <Divider>or</Divider>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="login-username">
          Email or username
          <Input
            id="login-username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoComplete="username"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </Label>
        <Label htmlFor="login-password">
          Password
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </Label>
        {error && <ErrorText id={errorId} role="alert">{error}</ErrorText>}
        <SubmitButton type="submit">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </SubmitButton>
      </Form>
      <Footer>
        {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
        <FooterButton type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </FooterButton>
      </Footer>
    </Panel>
  );
}
