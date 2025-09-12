import React from 'react';
import './DiffResult.css';

const DiffResult = ({ diff, score }) => {
  const renderDiff = () => {
    return diff.map(([op, text], index) => {
      switch (op) {
        case 0: // correct
          return <span key={index} className="diff-correct">{text}</span>;
        case -1: // missing from recitation
          return <span key={index} className="diff-missing">{text}</span>;
        case 1: // added in recitation
          return <span key={index} className="diff-incorrect">{text}</span>;
        default:
          return null;
      }
    });
  };

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = () => {
    if (score >= 90) return '🏆';
    if (score >= 70) return '👍';
    return '💪';
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Excellent !';
    if (score >= 70) return 'Bien joué !';
    if (score >= 50) return 'Continuez vos efforts !';
    return 'Réessayez, vous pouvez y arriver !';
  };

  return (
    <div className="diff-container">
      {/* Score Header */}
      <div className="diff-score-header">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            📊 Résultat de l'Analyse
          </h3>
          <div className={`text-right ${getScoreColor()}`}>
            <div className="text-2xl font-bold flex items-center">
              <span className="mr-2">{getScoreIcon()}</span>
              {score}%
            </div>
            <div className="text-sm font-medium">
              {getScoreMessage()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                score >= 90 ? 'bg-green-500' :
                score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(5, score)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="diff-legend">
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center">
            <span className="diff-legend-correct">■</span>
            <span className="ml-1">Correct</span>
          </div>
          <div className="flex items-center">
            <span className="diff-legend-incorrect">■</span>
            <span className="ml-1">Incorrect/Ajouté</span>
          </div>
          <div className="flex items-center">
            <span className="diff-legend-missing">■</span>
            <span className="ml-1">Manquant</span>
          </div>
        </div>
      </div>

      {/* Comparison Text */}
      <div className="diff-text-container">
        <h4 className="font-medium mb-2 text-sm text-gray-700">
          💬 Comparaison détaillée :
        </h4>
        <div className="diff-text-box">
          {renderDiff()}
        </div>
      </div>

      {/* Tips */}
      {score < 80 && (
        <div className="diff-tips">
          <h4 className="font-medium mb-2 text-sm">💡 Conseils pour améliorer :</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Articulez bien chaque mot</li>
            <li>• Respectez la ponctuation et les pauses</li>
            <li>• Parlez plus lentement si nécessaire</li>
            <li>• Relisez le texte original avant de répéter</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiffResult;
