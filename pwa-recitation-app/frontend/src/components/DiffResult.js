import React from 'react';
import './DiffResult.css';

const DiffResult = ({ diff, score }) => {
  const renderDiff = () => {
    return diff.map(([op, text], index) => {
      switch (op) {
        case 0: // correct
          return <span key={index} className="correct">{text}</span>;
        case -1: // missing from recitation
          return <span key={index} className="missing">{text}</span>;
        case 1: // added in recitation
          return <span key={index} className="incorrect">{text}</span>;
        default:
          return null;
      }
    });
  };

  return (
    <div className="diff-container">
      <h3>Résultat de l'Analyse</h3>
      <p><strong>Score de fidélité : {score}%</strong></p>
      <p>
        <span className="legend-correct">Correct</span> |{' '}
        <span className="legend-incorrect">Incorrect/Ajouté</span> |{' '}
        <span className="legend-missing">Manquant</span>
      </p>
      <div className="diff-text-box">
        {renderDiff()}
      </div>
    </div>
  );
};

export default DiffResult;
