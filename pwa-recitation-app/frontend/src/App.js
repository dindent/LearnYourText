import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import Page Components
import HomePage from './pages/HomePage';
import ImportPage from './pages/ImportPage';
import RecitationPage from './pages/RecitationPage';
import TheatrePage from './pages/TheatrePage';
import DashboardPage from './pages/DashboardPage';

const App = () => {
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
          </div>
        </nav>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/recite/:textId" element={<RecitationPage />} />
          <Route path="/theatre/:textId" element={<TheatrePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
