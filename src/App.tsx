import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { usePlayer } from './hooks/usePlayer';
import { usePull } from './hooks/usePull';
import { BaoId } from './types';
import { doUpgrade } from './services/api';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import LoginPage from './pages/LoginPage';
import PullPage from './pages/PullPage';
import CollectionPage from './pages/CollectionPage';
import AlmanacPage from './pages/AlmanacPage';

// ---- App Shell for authenticated pages ----
const AppShell: React.FC<{
  tokens: number;
  username: string;
  onLogout: () => void;
  children?: React.ReactNode;
}> = ({ tokens, username, onLogout }) => {
  return (
    <div style={styles.shell}>
      <Header tokens={tokens} username={username} onLogout={onLogout} />
      <main style={styles.main}>
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};

// ---- Protected Route wrapper ----
const ProtectedRoute: React.FC<{
  isLoggedIn: boolean;
  children: React.ReactElement;
}> = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ---- Main App ----
function App() {
  const { player, setPlayer, loading, error, login, logout } = usePlayer();

  const pull = usePull(player, (updatedPlayer) => {
    setPlayer(updatedPlayer);
  });

  const handleUpgrade = async (baoId: BaoId) => {
    if (!player) return;
    try {
      const result = await doUpgrade(player.username, baoId);
      // Update local player state with the upgrade result
      const updatedCollection = { ...player.collection };
      if (updatedCollection[baoId]) {
        updatedCollection[baoId] = {
          ...updatedCollection[baoId],
          rank: result.newRank,
          count: result.remainingCount,
        };
      }
      setPlayer({ ...player, collection: updatedCollection });
    } catch (e) {
      console.error('Upgrade failed:', e);
    }
  };

  const isLoggedIn = !!player;

  return (
    <BrowserRouter basename="/mishi">
      <Routes>
        {/* Public login route */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/pull" replace />
            ) : (
              <LoginPage onLogin={login} loading={loading} error={error} />
            )
          }
        />

        {/* Authenticated routes wrapped in AppShell */}
        <Route
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AppShell
                tokens={player?.tokens ?? 0}
                username={player?.username ?? ''}
                onLogout={logout}
              />
            </ProtectedRoute>
          }
        >
          <Route
            path="/pull"
            element={
              player ? (
                <PullPage
                  player={player}
                  pulling={pull.pulling}
                  pullResults={pull.pullResults}
                  showResults={pull.showResults}
                  animationRarity={pull.animationRarity}
                  animationActive={pull.animationActive}
                  pullSingle={pull.pullSingle}
                  pullMulti={pull.pullMulti}
                  dismissResults={pull.dismissResults}
                  onAnimationComplete={pull.onAnimationComplete}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/collection"
            element={
              player ? (
                <CollectionPage player={player} onUpgrade={handleUpgrade} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/almanac"
            element={
              player ? (
                <AlmanacPage player={player} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
};

export default App;
