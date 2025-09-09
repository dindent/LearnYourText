import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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

  // Ref to store the final transcript because state updates can be async
  const finalTranscript = useRef('');

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await api.get(`/texts/${textId}`);
        setText(res.data);
      } catch (err) {
        setError('Failed to load the text.');
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
      finalTranscript.current = final;
      setTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
        if (isListening) {
            // If it stops unexpectedly, restart it.
            // This can happen after a pause in speech.
            recognition.start();
        }
    };

    return () => {
        recognition.stop();
    }
  }, [isListening]);


  const handleListen = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      analyzeRecitation();
    } else {
      if (!recognition) {
        setError('Speech recognition is not supported in this browser.');
        return;
      }
      finalTranscript.current = '';
      setTranscript('');
      setResult(null);
      recognition.start();
      setIsListening(true);
    }
  };

  const analyzeRecitation = async () => {
    if (!finalTranscript.current) return;
    try {
      const res = await api.post(`/texts/${textId}/analyze`, {
        recitedText: finalTranscript.current,
      });
      setResult(res.data);
    } catch (err) {
      setError('Failed to analyze the text.');
    }
  };

  if (loading) return <p>Loading text...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!text) return <p>Text not found.</p>

  return (
    <div>
      <h1>{text.title}</h1>
      <h2>Texte Original</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap' }}>
        {text.content}
      </div>

      <hr style={{ margin: '20px 0' }} />

      <h2>Votre Récitation</h2>
      <button onClick={handleListen}>
        {isListening ? 'Arrêter et Analyser' : 'Commencer la Récitation'}
      </button>

      <p><em>{isListening ? "En écoute..." : "Prêt à commencer."}</em></p>

      <div>
        <strong>Transcription en direct:</strong> {transcript}
      </div>

      {result && (
        <div>
          <DiffResult diff={result.diff} score={result.fidelityScore} />
        </div>
      )}
    </div>
  );
};

export default RecitationPage;
