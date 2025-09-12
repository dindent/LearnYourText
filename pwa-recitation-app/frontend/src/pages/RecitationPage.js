import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import DiffResult from '../components/DiffResult';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'fr-FR';
}

const RecitationPage = () => {
  const { textId } = useParams();
  const [text, setText] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Ref to store the final transcript because state updates can be async
  const finalTranscript = useRef('');

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await api.get(`/texts/${textId}`);
        setText(res.data);
      } catch (err) {
        setError('Impossible de charger le texte.');
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, [textId]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscript.current += final;
      setTranscript(finalTranscript.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Erreur de reconnaissance vocale: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // If it stops unexpectedly, restart it.
        recognition.start();
      }
    };

    return () => {
      if (recognition) recognition.stop();
    }
  }, [isListening]);

  const handleListen = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      analyzeRecitation();
    } else {
      if (!recognition) {
        setError('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
        return;
      }
      finalTranscript.current = '';
      setTranscript('');
      setResult(null);
      setSessionStarted(true);
      setError('');
      recognition.start();
      setIsListening(true);
    }
  };

  const analyzeRecitation = async () => {
    if (!finalTranscript.current.trim()) {
      setError('Aucun texte détecté. Réessayez en parlant plus fort.');
      return;
    }
    
    setAnalysisLoading(true);
    try {
      const res = await api.post(`/texts/${textId}/analyze`, {
        recitedText: finalTranscript.current,
      });
      setResult(res.data);
    } catch (err) {
      setError('Erreur lors de l\'analyse du texte.');
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setTranscript('');
    setResult(null);
    setError('');
    finalTranscript.current = '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading mr-2"></div>
        <span>Chargement du texte...</span>
      </div>
    );
  }

  if (error && !text) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😞</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600 mb-4">Texte introuvable.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎯 {text.title}</h1>
          <p className="text-gray-600">Session de récitation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetSession}
            className="btn btn-secondary btn-sm"
            disabled={isListening}
          >
            🔄 Recommencer
          </button>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            ⬅️ Retour
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Text Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📖 Texte Original</h2>
            <p className="card-description">Le texte à réciter</p>
          </div>
          <div 
            className="bg-gray-50 p-4 rounded border-l-4 border-primary whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {text.content}
          </div>
        </div>

        {/* Recitation Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🎤 Votre Récitation</h2>
            <p className="card-description">
              {!sessionStarted 
                ? 'Cliquez sur le bouton pour commencer' 
                : isListening 
                  ? 'En cours d\'écoute...' 
                  : 'Session terminée'
              }
            </p>
          </div>

          {/* Speech Recognition Status */}
          {!recognition && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">
                ⚠️ La reconnaissance vocale n'est pas supportée par votre navigateur. 
                Veuillez utiliser Chrome ou Edge pour cette fonctionnalité.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Control Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleListen}
              disabled={!recognition || analysisLoading}
              className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} btn-lg`}
            >
              {analysisLoading ? (
                <span className="flex items-center">
                  <div className="loading mr-2"></div>
                  Analyse en cours...
                </span>
              ) : isListening ? (
                '🛑 Arrêter et Analyser'
              ) : (
                '🎤 Commencer la Récitation'
              )}
            </button>
          </div>

          {/* Live Transcript */}
          {sessionStarted && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📝 Transcription en direct:</h3>
              <div className="bg-gray-50 p-4 rounded border min-h-32 max-h-48 overflow-y-auto">
                {transcript ? (
                  <p className="whitespace-pre-wrap text-sm">
                    {transcript}
                    {isListening && <span className="animate-pulse">|</span>}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    {isListening ? 'Parlez maintenant...' : 'Aucun texte détecté'}
                  </p>
                )}
              </div>
              
              {transcript && (
                <div className="text-sm text-gray-500 mt-2">
                  {transcript.split(' ').length} mots détectés
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📊 Résultats de l'Analyse</h2>
              <p className="card-description">
                Comparaison entre le texte original et votre récitation
              </p>
            </div>
            <DiffResult diff={result.diff} score={result.fidelityScore} />
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={resetSession}
                className="btn btn-primary"
              >
                🔄 Nouvelle Session
              </button>
              <Link 
                to="/dashboard" 
                className="btn btn-secondary"
              >
                📚 Choisir un autre texte
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {!sessionStarted && (
        <div className="card mt-8">
          <div className="card-header">
            <h3 className="card-title">💡 Conseils pour une bonne session</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎤 Technique vocale :</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Parlez clairement et distinctement</li>
                <li>• Maintenez un débit régulier</li>
                <li>• Évitez les bruits de fond</li>
                <li>• Rapprochez-vous du microphone</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📝 Méthode :</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Lisez d'abord le texte attentivement</li>
                <li>• Récitez phrase par phrase si nécessaire</li>
                <li>• Ne vous arrêtez pas en cas d'erreur</li>
                <li>• Répétez pour améliorer votre score</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecitationPage;
