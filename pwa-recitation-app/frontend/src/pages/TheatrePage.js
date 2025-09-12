import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import DiffResult from '../components/DiffResult';
import diff_match_patch from 'diff-match-patch';

// Speech Recognition (STT)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'fr-FR';
}

// Text to Speech (TTS)
const synth = window.speechSynthesis;

const TheatrePage = () => {
  const { textId } = useParams();
  const [play, setPlay] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isUsersTurn, setIsUsersTurn] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [lineResult, setLineResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [playStats, setPlayStats] = useState({ correctLines: 0, totalLines: 0 });

  // Fetch play data
  useEffect(() => {
    const fetchPlay = async () => {
      try {
        const res = await api.get(`/texts/${textId}`);
        
        if (res.data.type !== 'theatre') {
          setError('Ce n\'est pas un script de théâtre.');
          return;
        }
        
        setPlay(res.data);
        
        // Check if structure exists and has characters
        if (res.data.structure && res.data.structure.length > 0) {
          // Extract unique characters
          const uniqueChars = [...new Set(res.data.structure.map(line => line.character))];
          setCharacters(uniqueChars);
          
          // Initialize stats
          const userLines = res.data.structure.filter(line => 
            selectedRole && line.character === selectedRole
          ).length;
          setPlayStats({ correctLines: 0, totalLines: userLines });
        } else {
          // No structure found, try to re-parse
          console.log('No structure found, attempting to re-parse...');
          try {
            const parseRes = await api.post(`/texts/${textId}/parse-theatre`);
            if (parseRes.data && parseRes.data.parsedScript) {
              // Update the play with new structure
              setPlay({...res.data, structure: parseRes.data.parsedScript});
              const uniqueChars = [...new Set(parseRes.data.parsedScript.map(line => line.character))];
              setCharacters(uniqueChars);
            } else {
              setError('Impossible d\'analyser le script. Vérifiez le format de votre pièce de théâtre.');
            }
          } catch (parseErr) {
            console.error('Parse error:', parseErr);
            setError('Ce script ne semble pas être au bon format. Les personnages n\'ont pas pu être détectés.');
          }
        }
        
      } catch (err) {
        setError('Impossible de charger la pièce.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlay();
  }, [textId, selectedRole]);

  // The main "engine" of the play
  useEffect(() => {
    if (!play || !selectedRole || currentLineIndex >= play.structure.length) return;

    const speakLine = (character, line) => {
      if (synth.speaking) {
        synth.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => {
        setIsReading(false);
        if (autoMode) {
          setTimeout(() => setCurrentLineIndex(prev => prev + 1), 500);
        }
      };
      synth.speak(utterance);
    };

    const currentLine = play.structure[currentLineIndex];
    if (currentLine.character === selectedRole) {
      setIsUsersTurn(true);
      setLineResult(null);
      setUserTranscript('');
    } else {
      setIsUsersTurn(false);
      if (autoMode) {
        speakLine(currentLine.character, currentLine.line);
      }
    }
  }, [play, selectedRole, currentLineIndex, autoMode]);

  const speakLine = (character, line) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => {
      setIsReading(false);
      if (autoMode) {
        setTimeout(() => setCurrentLineIndex(prev => prev + 1), 500);
      }
    };
    synth.speak(utterance);
  };

  const handleRoleSelection = (character) => {
    setSelectedRole(character);
    setCurrentLineIndex(0);
    setPlayStats({ correctLines: 0, totalLines: 0 });
  };

  const handleReciteLine = () => {
    if (!recognition) {
      setError("La reconnaissance vocale n'est pas supportée.");
      return;
    }
    
    setIsRecording(true);
    setError('');
    recognition.start();
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserTranscript(transcript);
      setIsRecording(false);
      analyzeLine(transcript);
    };
    
    recognition.onerror = (event) => {
      setError(`Erreur de reconnaissance: ${event.error}`);
      setIsRecording(false);
    };
  };

  const analyzeLine = (recited) => {
    const original = play.structure[currentLineIndex].line;
    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(original, recited);
    dmp.diff_cleanupSemantic(diff);
    const levenshtein = dmp.diff_levenshtein(diff);
    const score = ((original.length - levenshtein) / original.length) * 100;
    const result = { diff, fidelityScore: parseFloat(Math.max(0, score).toFixed(2)) };
    setLineResult(result);
    
    // Update stats
    if (result.fidelityScore >= 80) {
      setPlayStats(prev => ({ 
        ...prev, 
        correctLines: prev.correctLines + 1 
      }));
    }
  };

  const handleNextLine = () => {
    setCurrentLineIndex(prev => prev + 1);
    setUserTranscript('');
    setLineResult(null);
  };

  const resetPlay = () => {
    setCurrentLineIndex(0);
    setUserTranscript('');
    setLineResult(null);
    setPlayStats({ correctLines: 0, totalLines: 0 });
    if (synth.speaking) synth.cancel();
  };

  // Calculate progress
  const progress = play ? Math.round((currentLineIndex / play.structure.length) * 100) : 0;
  const userLinesCount = play && selectedRole ? 
    play.structure.filter(line => line.character === selectedRole).length : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading mr-2"></div>
        <span>Chargement de la pièce...</span>
      </div>
    );
  }

  if (error && !play) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎭</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!play) return null;

  // Debug information - more detailed
  console.log('=== THEATRE PAGE DEBUG ===');
  console.log('Play data:', play);
  console.log('Play type:', play?.type);
  console.log('Play structure exists:', !!play?.structure);
  console.log('Play structure length:', play?.structure?.length);
  console.log('Characters found:', characters);
  console.log('Characters length:', characters.length);
  console.log('Structure details:', play?.structure);
  console.log('Raw content preview:', play?.content?.substring(0, 200));
  console.log('========================');

  // Role Selection UI
  if (!selectedRole) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎭 {play.title}</h1>
          <p className="text-gray-600">Choisissez votre rôle pour commencer la répétition</p>
        </div>

        {/* Show debug info if no characters found */}
        {characters.length === 0 && (
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">⚠️ Problème de détection</h2>
            </div>
            <div className="space-y-4">
              <p className="text-yellow-600">
                Aucun personnage n'a été détecté dans cette pièce de théâtre.
              </p>
              <p className="text-sm text-gray-600">
                Cela peut arriver si le format du script n'est pas reconnu automatiquement.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      console.log('Attempting to re-parse...');
                      const parseRes = await api.post(`/texts/${textId}/parse-theatre`);
                      if (parseRes.data && parseRes.data.parsedScript) {
                        setPlay({...play, structure: parseRes.data.parsedScript});
                        const uniqueChars = [...new Set(parseRes.data.parsedScript.map(line => line.character))];
                        setCharacters(uniqueChars);
                        setError('');
                      }
                    } catch (err) {
                      setError('Impossible de re-analyser le script.');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                >
                  🔄 Re-analyser le script
                </button>
                <Link to={`/import`} className="btn btn-secondary btn-sm">
                  ✏️ Modifier le texte
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">👥 Personnages disponibles</h2>
            <p className="card-description">
              {characters.length > 0 
                ? "Sélectionnez le personnage que vous souhaitez interpréter"
                : "Aucun personnage détecté - essayez de re-analyser le script"
              }
            </p>
          </div>

          {characters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map(char => {
                const lineCount = play.structure ? play.structure.filter(line => line.character === char).length : 0;
                return (
                  <div
                    key={char}
                    onClick={() => handleRoleSelection(char)}
                    className="p-4 border rounded-lg hover:border-primary hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{char}</h3>
                        <p className="text-sm text-gray-600">
                          {lineCount} réplique{lineCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-2xl">🎭</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🎭</div>
              <p>Aucun personnage détecté dans ce script</p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/dashboard" className="btn btn-secondary">
              ⬅️ Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentLine = play.structure[currentLineIndex];
  const isPlayFinished = currentLineIndex >= play.structure.length;

  // Play-through UI
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Controls */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎭 {play.title}</h1>
          <p className="text-gray-600">
            Vous jouez : <span className="font-semibold text-primary">{selectedRole}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`btn btn-sm ${autoMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            {autoMode ? '⚡ Auto' : '⏸️ Manuel'}
          </button>
          <button
            onClick={resetPlay}
            className="btn btn-secondary btn-sm"
          >
            🔄 Recommencer
          </button>
          <button
            onClick={() => setSelectedRole(null)}
            className="btn btn-secondary btn-sm"
          >
            👥 Changer de rôle
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progression de la pièce</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Réplique {currentLineIndex + 1} sur {play.structure.length}</span>
          <span>Vos répliques : {playStats.correctLines}/{userLinesCount}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card mb-6">
          <div className="text-red-600 flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {isPlayFinished ? (
        /* End of Play */
        <div className="card text-center">
          <div className="py-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Bravo ! Fin de la pièce</h2>
            <div className="mb-6">
              <div className="text-lg mb-2">Vos performances :</div>
              <div className="text-3xl font-bold text-primary">
                {userLinesCount > 0 ? Math.round((playStats.correctLines / userLinesCount) * 100) : 0}%
              </div>
              <div className="text-gray-600">
                {playStats.correctLines} répliques correctes sur {userLinesCount}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={resetPlay} className="btn btn-primary btn-lg">
                🔄 Recommencer la pièce
              </button>
              <button
                onClick={() => setSelectedRole(null)}
                className="btn btn-secondary btn-lg"
              >
                👥 Changer de rôle
              </button>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                📚 Autres textes
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Scene */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎬 Scène en cours</h3>
                <p className="card-description">
                  {isUsersTurn ? `À vous de jouer, ${selectedRole} !` : `${currentLine.character} parle...`}
                </p>
              </div>

              <div className="space-y-4">
                {/* Current Speaker */}
                <div className={`p-4 rounded-lg ${
                  isUsersTurn ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">
                      {currentLine.character}
                    </span>
                    {isReading && (
                      <span className="text-sm text-gray-600 flex items-center">
                        <div className="loading mr-2"></div>
                        En lecture...
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    "{currentLine.line}"
                  </p>
                </div>

                {/* User Controls */}
                {isUsersTurn && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <button
                        onClick={handleReciteLine}
                        disabled={!!userTranscript || isRecording || !recognition}
                        className="btn btn-primary btn-lg"
                      >
                        {isRecording ? (
                          <span className="flex items-center">
                            <div className="loading mr-2"></div>
                            En écoute...
                          </span>
                        ) : (
                          '🎤 Réciter la réplique'
                        )}
                      </button>
                    </div>

                    {/* User Transcript */}
                    {userTranscript && (
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold mb-2">📝 Votre récitation :</h4>
                        <p className="italic">"{userTranscript}"</p>
                      </div>
                    )}

                    {/* Line Analysis */}
                    {lineResult && (
                      <div className="space-y-4">
                        <DiffResult diff={lineResult.diff} score={lineResult.fidelityScore} />
                        <div className="text-center">
                          <button
                            onClick={handleNextLine}
                            className="btn btn-success"
                          >
                            ➡️ Réplique suivante
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual mode controls for other characters */}
                {!autoMode && !isUsersTurn && (
                  <div className="text-center">
                    <button
                      onClick={() => speakLine(currentLine.character, currentLine.line)}
                      className="btn btn-secondary mr-4"
                      disabled={isReading}
                    >
                      🔊 Faire parler {currentLine.character}
                    </button>
                    <button
                      onClick={handleNextLine}
                      className="btn btn-primary"
                    >
                      ⏭️ Passer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Play Info */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">📋 Informations</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Personnages :</span>
                  <span>{characters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total répliques :</span>
                  <span>{play.structure.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vos répliques :</span>
                  <span>{userLinesCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">📊 Statistiques</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Précision</span>
                    <span>
                      {userLinesCount > 0 ? 
                        Math.round((playStats.correctLines / Math.max(1, playStats.totalLines || 1)) * 100) : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${userLinesCount > 0 ? 
                          (playStats.correctLines / Math.max(1, userLinesCount)) * 100 : 0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">💡 Conseils</h4>
              </div>
              <div className="text-sm space-y-2 text-gray-600">
                <p>• Parlez clairement et distinctement</p>
                <p>• Respectez le rythme du dialogue</p>
                <p>• Utilisez le mode manuel pour plus de contrôle</p>
                <p>• N'hésitez pas à recommencer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheatrePage;
