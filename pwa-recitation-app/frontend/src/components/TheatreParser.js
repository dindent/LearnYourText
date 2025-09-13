import React, { useState } from 'react';
import { testParseScript } from '../services/localApi';
import { getCharacterStats } from '../utils/scriptParser';

const TheatreParser = ({ content, onParseComplete }) => {
  const [parseResult, setParseResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testParsing = async () => {
    if (!content.trim()) {
      setError('Le contenu est requis pour tester l\'analyse');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await testParseScript(content);
      const parsed = response.data?.parsedScript || [];

      // Compute derived stats client-side
      const characterStats = getCharacterStats(parsed);
      const characterCount = Object.keys(characterStats).length;
      const totalLines = parsed.length;
      const success = totalLines > 0 && characterCount > 0;
      const preview = parsed.slice(0, 10);

      const result = {
        parsedScript: parsed,
        characterStats,
        characterCount,
        totalLines,
        success,
        preview,
      };

      setParseResult(result);
      if (onParseComplete) {
        onParseComplete(result);
      }
    } catch (err) {
      setError('Erreur lors du test d\'analyse du script');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theatre-parser">
      <div className="mb-4">
        <button
          onClick={testParsing}
          disabled={loading || !content.trim()}
          className="btn btn-secondary"
        >
          {loading ? 'Analyse en cours...' : '🎭 Tester l\'analyse du script'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {parseResult && (
        <div className="parse-results">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistics */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">📊 Statistiques</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Personnages détectés:</span>
                  <span className="font-bold text-primary">
                    {parseResult.characterCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lignes de dialogue:</span>
                  <span className="font-bold text-primary">
                    {parseResult.totalLines}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Analyse:</span>
                  <span className={`font-bold ${parseResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {parseResult.success ? 'Réussie ✅' : 'Échec ❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Characters List */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">🎭 Personnages</h4>
              </div>
              <div className="space-y-2">
                {Object.entries(parseResult.characterStats || {}).map(([character, stats]) => (
                  <div key={character} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{character}</span>
                    <span className="text-sm text-gray-600">
                      {stats.lineCount} répliques
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview of parsed dialogue */}
          {parseResult.preview && parseResult.preview.length > 0 && (
            <div className="card mt-6">
              <div className="card-header">
                <h4 className="card-title">👁️ Aperçu du script analysé</h4>
                <p className="card-description">
                  Premières lignes détectées (max 10)
                </p>
              </div>
              <div className="space-y-3">
                {parseResult.preview.map((line, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="font-bold text-primary text-sm mb-1">
                      {line.character}
                    </div>
                    <div className="text-gray-700">
                      "{line.line}"
                    </div>
                  </div>
                ))}
                {parseResult.totalLines > 10 && (
                  <div className="text-center text-gray-500 text-sm pt-2">
                    ... et {parseResult.totalLines - 10} autres lignes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Character Statistics Details */}
          {parseResult.characterStats && Object.keys(parseResult.characterStats).length > 0 && (
            <div className="card mt-6">
              <div className="card-header">
                <h4 className="card-title">📈 Statistiques détaillées</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Personnage</th>
                      <th className="text-left p-2">Répliques</th>
                      <th className="text-left p-2">Mots total</th>
                      <th className="text-left p-2">Mots/réplique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(parseResult.characterStats)
                      .sort((a, b) => b[1].lineCount - a[1].lineCount)
                      .map(([character, stats]) => (
                        <tr key={character} className="border-b">
                          <td className="p-2 font-medium">{character}</td>
                          <td className="p-2">{stats.lineCount}</td>
                          <td className="p-2">{stats.wordCount}</td>
                          <td className="p-2">{stats.averageLineLength}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TheatreParser;