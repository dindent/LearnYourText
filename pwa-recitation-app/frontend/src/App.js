import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Page Components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ImportPage from './pages/ImportPage';
import RecitationPage from './pages/RecitationPage';
import TheatrePage from './pages/TheatrePage';
import PrivateRoute from './components/routing/PrivateRoute';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Temporarily bypass authentication - set to true for development
  const bypassAuth = true;
  const shouldShowAuth = !bypassAuth && isAuthenticated;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header>
        <nav>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-primary">
                📚 LearnYourText
              </Link>
              <ul className="flex items-center gap-6">
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/dashboard">Mes Textes</Link></li>
                <li><Link to="/import">Importer</Link></li>
              </ul>
            </div>
            
            {/* Authentication UI (hidden when bypassed) */}
            <div style={{ display: bypassAuth ? 'none' : 'flex', gap: '1rem' }}>
              {shouldShowAuth ? (
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Déconnexion
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-secondary btn-sm">Connexion</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Show auth pages only when not bypassed */}
          {!bypassAuth && (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </>
          )}

          {/* Main Routes - accessible when auth is bypassed or user is authenticated */}
          {bypassAuth ? (
            <>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/recite/:textId" element={<RecitationPage />} />
              <Route path="/theatre/:textId" element={<TheatrePage />} />
            </>
          ) : (
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/recite/:textId" element={<RecitationPage />} />
              <Route path="/theatre/:textId" element={<TheatrePage />} />
            </Route>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
