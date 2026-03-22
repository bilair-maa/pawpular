import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { SelectionProvider } from './context/SelectionContext';
import { SavedPetsProvider } from './context/SavedPetsContext';
import { FollowProvider } from './context/FollowContext';
import { UserProvider } from './context/UserContext';
import { LoginModalProvider } from './context/LoginModalContext';
import { PetsProvider } from './context/PetsContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginModal } from './components/auth/LoginModal';
import { PageWrapper } from './components/layout/PageWrapper';
import { RouteFallback } from './components/ui/RouteFallback';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Each page loads only when its route is first visited
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then(m => ({ default: m.DetailPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage').then(m => ({ default: m.DownloadsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const CrewsPage = lazy(() => import('./pages/CrewsPage').then(m => ({ default: m.CrewsPage })));
const CrewDetailPage = lazy(() => import('./pages/CrewDetailPage').then(m => ({ default: m.CrewDetailPage })));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <UserProvider>
          <LoginModalProvider>
            <PetsProvider>
              <SavedPetsProvider>
                <FollowProvider>
                  <SelectionProvider>
                    <PageWrapper>
                      <ErrorBoundary>
                        <Suspense fallback={<RouteFallback />}>
                          {/* ProtectedRoute redirects guests to home and opens the sign-in modal */}
          <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/gallery" element={<GalleryPage />} />
                            <Route path="/pets/:petId" element={<DetailPage />} />
                            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                            <Route path="/downloads" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
                            <Route path="/following" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/crews" element={<CrewsPage />} />
                            <Route path="/crews/:crewId" element={<CrewDetailPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </Suspense>
                      </ErrorBoundary>
                    </PageWrapper>
                    <LoginModal />
                  </SelectionProvider>
                </FollowProvider>
              </SavedPetsProvider>
            </PetsProvider>
          </LoginModalProvider>
        </UserProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
