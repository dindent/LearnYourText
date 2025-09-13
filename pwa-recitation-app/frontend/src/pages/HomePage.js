import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-primary">
            🎭 Maîtrisez vos textes et scènes de théâtre
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une application professionnelle pour apprendre, réviser et perfectionner vos répliques. 
            Idéale pour les comédiens, étudiants en art dramatique et passionnés de théâtre.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link to="/texts" className="btn btn-primary btn-lg">
            🚀 Accéder à mes textes
          </Link>
          <Link to="/import" className="btn btn-secondary btn-lg">
            📝 Importer un texte
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Gestion des textes</h3>
          <p className="text-gray-600">
            Importez et organisez facilement vos pièces, monologues et répliques. 
            Support des formats texte et reconnaissance OCR.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Entraînement ciblé</h3>
          <p className="text-gray-600">
            Révisez vos textes avec notre système intelligent qui vous aide à 
            mémoriser et à corriger vos erreurs en temps réel.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold mb-2">Mode théâtre</h3>
          <p className="text-gray-600">
            Pratiquez vos scènes avec le mode spécialement conçu pour le théâtre, 
            avec gestion des personnages et didascalies.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
