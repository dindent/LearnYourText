import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import DiffResult from '../components/DiffResult';
import diff_match_patch from 'diff-match-patch';

// Speech Recognition (STT)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false; // We want to stop after each line
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

  // Fetch play data
  useEffect(() => {
    const fetchPlay = async () => {
      try {
        const res = await api.get(`/texts/${textId}`);
        if (res.data.type !== 'theatre' || !res.data.structure) {
          setError('This is not a valid theatre script.');
          return;
        }
        setPlay(res.data);
        // Extract unique characters
        const uniqueChars = [...new Set(res.data.structure.map(line => line.character))];
        setCharacters(uniqueChars);
      } catch (err) {
        setError('Failed to load the play.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlay();
  }, [textId]);

  // The main "engine" of the play
  useEffect(() => {
    if (!play || !selectedRole || currentLineIndex >= play.structure.length) return;

    const currentLine = play.structure[currentLineIndex];
    if (currentLine.character === selectedRole) {
      setIsUsersTurn(true);
      setLineResult(null); // Clear previous line result
      setUserTranscript('');
    } else {
      setIsUsersTurn(false);
      speakLine(currentLine.character, currentLine.line);
    }
  }, [play, selectedRole, currentLineIndex]);


  const speakLine = (character, line) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(`${character} dit : ${line}`);
    utterance.lang = 'fr-FR';
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => {
      setIsReading(false);
      // Automatically move to the next line
      setCurrentLineIndex(prev => prev + 1);
    };
    synth.speak(utterance);
  };

  const handleRoleSelection = (character) => {
    setSelectedRole(character);
    setCurrentLineIndex(0);
  };

  const handleReciteLine = () => {
    if (!recognition) {
        setError("Speech recognition not supported.");
        return;
    }
    recognition.start();
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        analyzeLine(transcript);
    };
  };

  const analyzeLine = (recited) => {
    const original = play.structure[currentLineIndex].line;
    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(original, recited);
    dmp.diff_cleanupSemantic(diff);
    const levenshtein = dmp.diff_levenshtein(diff);
    const score = ((original.length - levenshtein) / original.length) * 100;
    setLineResult({ diff, fidelityScore: parseFloat(score.toFixed(2)) });
  };

  const handleNextLine = () => {
      setCurrentLineIndex(prev => prev + 1);
  }

  // UI Rendering
  if (loading) return <p>Loading play...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!play) return null;

  // 1. Role Selection UI
  if (!selectedRole) {
    return (
      <div>
        <h1>{play.title}</h1>
        <h2>Choisissez votre rôle</h2>
        {characters.map(char => (
          <button key={char} onClick={() => handleRoleSelection(char)}>
            {char}
          </button>
        ))}
      </div>
    );
  }

  const currentLine = play.structure[currentLineIndex];

  // 2. Play-through UI
  return (
    <div>
      <h1>{play.title}</h1>
      <p>Vous jouez le rôle de : <strong>{selectedRole}</strong></p>
      <hr />

      {currentLineIndex >= play.structure.length ? (
        <div>
            <h2>Fin de la pièce.</h2>
            <button onClick={() => { setSelectedRole(null); setCurrentLineIndex(0); }}>Changer de rôle</button>
        </div>
      ) : (
        <div>
          <h3>Scène en cours...</h3>
          <div style={{ fontStyle: 'italic', marginBottom: '20px' }}>
            {isReading && `(Écoutez ${currentLine.character})`}
            {isUsersTurn && `(À vous de jouer, ${selectedRole} !)`}
          </div>

          {isUsersTurn ? (
            <div>
              <p><strong>Votre réplique :</strong> "{currentLine.line}"</p>
              <button onClick={handleReciteLine} disabled={!!userTranscript}>
                Réciter la réplique
              </button>
              {userTranscript && <p>Vous avez dit : "{userTranscript}"</p>}
              {lineResult && (
                  <div>
                      <DiffResult diff={lineResult.diff} score={lineResult.fidelityScore} />
                      <button onClick={handleNextLine} style={{marginTop: '10px'}}>Réplique suivante</button>
                  </div>
              )}
            </div>
          ) : (
            <p><strong>{currentLine.character}:</strong> {currentLine.line}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TheatrePage;
