import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const res = await api.get('/texts');
        setTexts(res.data);
      } catch (err) {
        setError('Failed to load texts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTexts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Tableau de bord</h1>
      <h2>Mes Textes</h2>
      {texts.length > 0 ? (
        <ul>
          {texts.map((text) => (
            <li key={text._id}>
              <h3>{text.title} ({text.type === 'theatre' ? 'Théâtre' : 'Individuel'})</h3>
              <p>{text.content.substring(0, 100)}...</p>
              {text.type === 'theatre' ? (
                <Link to={`/theatre/${text._id}`}>Répéter la pièce</Link>
              ) : (
                <Link to={`/recite/${text._id}`}>Commencer la récitation</Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Vous n'avez encore importé aucun texte. <Link to="/import">Importer mon premier texte</Link>.
        </p>
      )}
    </div>
  );
};

export default DashboardPage;
