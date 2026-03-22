import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Heart, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { useUser } from '../../context/useUser';
import { useLoginModal } from '../../context/LoginModalContext';

const MOBILE = '639px'; // Screen width below which the desktop nav hides and the hamburger appears

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, ${({ theme }) => theme.colors.background} 72%, transparent);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-bottom: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border} 70%, transparent);
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  min-height: 56px;
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(18px, 3vw, 34px) 0 20px;
`;

const Logo = styled.img`
  width: 39px;
  height: 39px;
  object-fit: contain;
  transition: transform 0.35s cubic-bezier(.34, 1.56, .64, 1);
`;

const Brand = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 800;
  text-decoration: none;
  flex-shrink: 0;

  &:hover ${Logo} {
    transform: rotate(-6deg) scale(1.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 7px;

  @media (max-width: ${MOBILE}) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const NavItem = styled(NavLink)`
  color: ${({ theme }) => theme.colors.textMuted};
  background-color: transparent;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 6px 12px;
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  line-height: 1;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.surface} 60%, transparent);
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.primarySoft} 74%, white);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const IconLink = styled(NavLink)`
  width: ${({ theme }) => theme.controls.compact};
  height: ${({ theme }) => theme.controls.compact};
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 800;
  line-height: 1;
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), color 0.2s ease, border-color 0.2s ease;

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    stroke-width: 2.2;
  }

  &:hover,
  &.active {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SignInButton = styled.button`
  min-width: 80px;
  height: ${({ theme }) => theme.controls.compact};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.text};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0 12px;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.18s cubic-bezier(.34, 1.56, .64, 1);

  @media (max-width: ${MOBILE}) {
    display: none;
  }

  &:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.text} 92%, black);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;


const UserMenuWrap = styled.div`
  position: relative;

  @media (max-width: ${MOBILE}) {
    display: none;
  }
`;

const UserButton = styled.button`
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 900;
  transition: transform 0.18s cubic-bezier(.34, 1.56, .64, 1), background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(-4px); }
  to   { opacity: 1; transform: none; }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + ${({ theme }) => theme.spacing.md});
  z-index: 10;
  width: 240px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 18px 44px -18px ${({ theme }) => theme.colors.shadowStrong};
  padding: ${({ theme }) => theme.spacing.sm};
  animation: ${popIn} 0.2s cubic-bezier(.34, 1.56, .64, 1);
  transform-origin: top right;
`;

const MenuHeader = styled.div`
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 10px 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Avatar = styled.span`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.surface};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  border-radius: ${({ theme }) => theme.radii.circle};
  font-weight: 900;
  flex-shrink: 0;
`;

const MenuName = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.text};
  font-family: Fredoka, Nunito, ui-rounded, system-ui, sans-serif;
  line-height: 1.15;
  text-transform: capitalize;
`;

const MenuEmail = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
`;

const MenuLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 11px 12px;
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;

  &:hover,
  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const MenuLinks = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  color: ${({ theme }) => theme.colors.textMuted};
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 800;
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    background-color: ${({ theme }) => theme.colors.errorBg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

// ── Mobile drawer ────────────────────────────────────────────────────────────

const HamburgerButton = styled.button`
  display: none;

  @media (max-width: ${MOBILE}) {
    display: grid;
    place-items: center;
    width: ${({ theme }) => theme.controls.compact};
    height: ${({ theme }) => theme.controls.compact};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.borderStrong};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }

    svg {
      width: ${({ theme }) => theme.icons.md};
      height: ${({ theme }) => theme.icons.md};
      stroke-width: 2.2;
    }
  }
`;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 98;
  background: ${({ theme }) => theme.colors.darkOverlay};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 0.25s ease;

  @media (min-width: 640px) {
    display: none;
  }
`;

const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  flex-direction: column;
  width: min(300px, 84vw);
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -8px 0 40px -10px ${({ theme }) => theme.colors.shadowStrong};
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: 2px;

  @media (min-width: 640px) {
    display: none;
  }
`;

const DrawerTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DrawerClose = styled.button`
  display: grid;
  place-items: center;
  width: ${({ theme }) => theme.controls.compact};
  height: ${({ theme }) => theme.controls.compact};
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  svg {
    width: ${({ theme }) => theme.icons.md};
    height: ${({ theme }) => theme.icons.md};
    stroke-width: 2.2;
  }
`;

const DrawerNavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 13px ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.sm};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 800;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surfaceAlt};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const DrawerDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const DrawerLogout = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 13px ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 800;
  cursor: pointer;
  text-align: left;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    background-color: ${({ theme }) => theme.colors.errorBg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const DrawerSignIn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 13px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.surface};
  background-color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 900;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.text} 92%, black);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

// ────────────────────────────────────────────────────────────────────────────

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useUser();
  const { openLogin } = useLoginModal();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Whether the user account dropdown is open
  const [mobileOpen, setMobileOpen] = useState(false); // Whether the mobile slide-out drawer is open
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  // Intercepts clicks on auth-only links and opens the sign-in modal instead
  function requireAccount(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isAuthenticated) return;
    event.preventDefault();
    openLogin('register');
  }

  const initial = currentUser?.username.charAt(0).toLocaleUpperCase() ?? 'F';
  const userEmail = currentUser ? `@${currentUser.userKey}` : '';

  return (
    <Header>
      <Inner>
        <Brand to="/">
          <Logo src="/logo.png" alt="" aria-hidden="true" />
          Pawpular
        </Brand>

        <Nav aria-label="Primary navigation">
          <NavItem to="/" end>Home</NavItem>
          <NavItem to="/gallery">Gallery</NavItem>
          <NavItem to="/crews">Crews</NavItem>
          <NavItem to="/about">About</NavItem>
        </Nav>

        <Actions>
          <IconLink to="/favorites" aria-label="Favorites" onClick={requireAccount}>
            <Heart />
          </IconLink>

          {isAuthenticated ? (
            <UserMenuWrap ref={userMenuRef}>
              <UserButton
                type="button"
                aria-label="Open user menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(open => !open)}
              >
                {initial}
              </UserButton>
              {menuOpen && (
                <Menu role="menu">
                  <MenuHeader>
                    <Avatar aria-hidden="true">{initial}</Avatar>
                    <div>
                      <MenuName>{currentUser?.username}</MenuName>
                      <MenuEmail>{userEmail}</MenuEmail>
                    </div>
                  </MenuHeader>
                  <MenuLinks>
                    <MenuLink role="menuitem" to="/following" onClick={() => setMenuOpen(false)}>Following</MenuLink>
                    <MenuLink role="menuitem" to="/favorites" onClick={() => setMenuOpen(false)}>Favorites</MenuLink>
                    <MenuLink role="menuitem" to="/downloads" onClick={() => setMenuOpen(false)}>Downloads</MenuLink>
                  </MenuLinks>
                  <LogoutButton type="button" role="menuitem" onClick={handleLogout}>Sign out</LogoutButton>
                </Menu>
              )}
            </UserMenuWrap>
          ) : (
            <SignInButton type="button" onClick={() => openLogin()}>
              Sign in
            </SignInButton>
          )}

          <HamburgerButton
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon aria-hidden="true" />
          </HamburgerButton>
        </Actions>
      </Inner>

      <MobileMenu
        open={mobileOpen}
        onClose={closeMobile}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onSignIn={() => { closeMobile(); openLogin(); }}
      />
    </Header>
  );
}

// The slide-in drawer shown on small screens, rendered in a portal so it sits above everything
function MobileMenu({
  open,
  onClose,
  isAuthenticated,
  onLogout,
  onSignIn,
}: {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onSignIn: () => void;
}) {
  return createPortal(
    <>
      <Overlay $open={open} onClick={onClose} aria-hidden="true" />
      <Drawer $open={open} aria-label="Mobile navigation" aria-hidden={!open}>
        <DrawerTop>
          <Brand to="/" onClick={onClose}>
            <Logo src="/logo.png" alt="" aria-hidden="true" />
            Pawpular
          </Brand>
          <DrawerClose type="button" aria-label="Close navigation menu" onClick={onClose}>
            <XIcon aria-hidden="true" />
          </DrawerClose>
        </DrawerTop>

        <DrawerNavItem to="/" end onClick={onClose}>Home</DrawerNavItem>
        <DrawerNavItem to="/gallery" onClick={onClose}>Gallery</DrawerNavItem>
        <DrawerNavItem to="/crews" onClick={onClose}>Crews</DrawerNavItem>
        <DrawerNavItem to="/about" onClick={onClose}>About</DrawerNavItem>

        {isAuthenticated && (
          <>
            <DrawerDivider />
            <DrawerNavItem to="/favorites" onClick={onClose}>Favorites</DrawerNavItem>
            <DrawerNavItem to="/following" onClick={onClose}>Following</DrawerNavItem>
            <DrawerNavItem to="/downloads" onClick={onClose}>Downloads</DrawerNavItem>
            <DrawerNavItem to="/profile" onClick={onClose}>Profile</DrawerNavItem>
            <DrawerDivider />
            <DrawerLogout type="button" onClick={onLogout}>Sign out</DrawerLogout>
          </>
        )}

        {!isAuthenticated && (
          <DrawerSignIn type="button" onClick={onSignIn}>
            Sign in
          </DrawerSignIn>
        )}
      </Drawer>
    </>,
    document.body
  );
}
