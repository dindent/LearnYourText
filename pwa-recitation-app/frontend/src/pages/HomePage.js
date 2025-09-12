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
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            🚀 Commencer maintenant
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

      {/* How it works */}
      <section className="card">
        <div className="card-header text-center">
          <h2 className="card-title text-2xl">Comment ça fonctionne ?</h2>
          <p className="card-description">Trois étapes simples pour commencer</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Importez votre texte</h3>
            <p className="text-gray-600 text-sm">
              Copiez-collez ou importez votre pièce depuis un fichier. 
              L'application détecte automatiquement la structure.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Choisissez votre mode</h3>
            <p className="text-gray-600 text-sm">
              Mode récitation pour l'apprentissage ligne par ligne, 
              ou mode théâtre pour les scènes complètes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">Entraînez-vous</h3>
            <p className="text-gray-600 text-sm">
              Répétez et perfectionnez votre jeu. 
              L'application vous indique vos progrès et erreurs.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="text-center p-4">
          <div className="text-2xl font-bold text-primary">∞</div>
          <div className="text-sm text-gray-600">Textes illimités</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold text-primary">🎯</div>
          <div className="text-sm text-gray-600">Précision de mémorisation</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold text-primary">⚡</div>
          <div className="text-sm text-gray-600">Interface rapide</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold text-primary">📱</div>
          <div className="text-sm text-gray-600">Compatible mobile</div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
