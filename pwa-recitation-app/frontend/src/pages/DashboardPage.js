import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, theatre: 0, individual: 0 });

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const res = await api.get('/texts');
        const textsData = res.data || [];
        setTexts(textsData);
        
        // Calculate stats
        const total = textsData.length;
        const theatre = textsData.filter(t => t.type === 'theatre').length;
        const individual = total - theatre;
        setStats({ total, theatre, individual });
        
      } catch (err) {
        setError('Erreur lors du chargement des textes.');
        console.error('API Error:', err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchTexts();
  }, []);

  const deleteText = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce texte ?')) {
      try {
        await api.delete(`/texts/${id}`);
        setTexts(texts.filter(text => text._id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Erreur lors de la suppression du texte.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading"></div>
        <span className="ml-2">Chargement de vos textes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😞</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📚 Mes Textes</h1>
          <p className="text-gray-600">Gérez et révisez vos textes et pièces de théâtre</p>
        </div>
        <Link to="/import" className="btn btn-primary">
          ➕ Nouveau texte
        </Link>
      </div>

      {/* Statistics Cards */}
      {texts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-gray-600">Textes total</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{stats.theatre}</div>
            <div className="text-gray-600">Pièces de théâtre</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{stats.individual}</div>
            <div className="text-gray-600">Textes individuels</div>
          </div>
        </div>
      )}

      {/* Texts List */}
      {texts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {texts.map((text) => (
            <div key={text._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title">{text.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        text.type === 'theatre' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {text.type === 'theatre' ? '🎭 Théâtre' : '📝 Individuel'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteText(text._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  {text.content ? text.content.substring(0, 120) + '...' : 'Aucun aperçu disponible'}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                {text.type === 'theatre' ? (
                  <Link 
                    to={`/theatre/${text._id}`} 
                    className="btn btn-primary flex-1 btn-sm"
                  >
                    🎭 Répéter la pièce
                  </Link>
                ) : (
                  <Link 
                    to={`/recite/${text._id}`} 
                    className="btn btn-primary flex-1 btn-sm"
                  >
                    🎯 Commencer la récitation
                  </Link>
                )}
              </div>

              {/* Progress indicator (placeholder for future feature) */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Dernière révision</span>
                  <span>
                    {text.lastPracticed 
                      ? new Date(text.lastPracticed).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-xl font-semibold mb-4">Aucun texte pour le moment</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez par importer votre premier texte ou pièce de théâtre pour 
              démarrer vos sessions d'entraînement.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/import" className="btn btn-primary btn-lg">
                📝 Importer mon premier texte
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;