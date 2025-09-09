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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header>
        <nav>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/dashboard">Tableau de bord</Link></li>
                <li><Link to="/import">Importer</Link></li>
                <li><button onClick={handleLogout}>Déconnexion</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Connexion</Link></li>
                <li><Link to="/register">Inscription</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/recite/:textId" element={<RecitationPage />} />
            <Route path="/theatre/:textId" element={<TheatrePage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
