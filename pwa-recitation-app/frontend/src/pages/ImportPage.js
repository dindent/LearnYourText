import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createWorker } from 'tesseract.js';

const ImportPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'individual',
  });
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const navigate = useNavigate();

  const { title, content, type } = formData;

  const onManualChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'theatre' : 'individual') : value,
    });
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    try {
      await api.post('/texts', formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to import text. Please try again.');
    }
  };

  const onPdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    try {
      await api.post('/texts/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to upload PDF.');
    }
  };

  const handleOcr = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    setOcrStatus('Initializing...');
    setOcrProgress(0);
    const worker = await createWorker({
      logger: m => {
        setOcrStatus(m.status);
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      }
    });

    await worker.loadLanguage('fra'); // Load French language model
    await worker.initialize('fra');
    const { data: { text } } = await worker.recognize(imageFile);
    setOcrStatus('Done.');

    // Populate the manual form with the OCR result
    setFormData(prev => ({
      ...prev,
      title: imageFile.name.replace(/\.[^/.]+$/, ""), // Use filename as title
      content: text,
    }));

    await worker.terminate();
  };


  return (
    <div>
      <h1>Importer un Nouveau Texte</h1>
      <form onSubmit={onManualSubmit}>
        {/* ... Manual form fields ... */}
        <div>
          <label htmlFor="title">Titre</label>
          <input type="text" name="title" value={title} onChange={onManualChange} required />
        </div>
        <div>
          <label htmlFor="content">Contenu (peut être rempli par OCR)</label>
          <textarea name="content" value={content} onChange={onManualChange} required rows="15"></textarea>
        </div>
        <div>
          <input type="checkbox" name="type" checked={type === 'theatre'} onChange={onManualChange} id="isTheatre" />
          <label htmlFor="isTheatre"> Il s'agit d'une pièce de théâtre</label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Importer le Texte Manuellement</button>
      </form>

      <hr />

      <h2>Ou Importer depuis un Fichier</h2>

      <div>
        <h4>Importer depuis un PDF</h4>
        <input type="file" name="pdfFile" accept=".pdf" onChange={onPdfFileChange} />
        <button onClick={handlePdfUpload} disabled={!pdfFile}>Uploader le PDF</button>
      </div>

      <hr />

      <div>
        <h4>Extraire le texte depuis une Image (OCR)</h4>
        <input type="file" name="ocrFile" accept="image/*" onChange={handleOcr} />
        {ocrStatus && ocrStatus !== 'Done.' && (
          <div>
            <p>Statut de l'OCR : {ocrStatus}</p>
            <progress value={ocrProgress} max="100"></progress>
          </div>
        )}
        {ocrStatus === 'Done.' && <p style={{color: 'green'}}>OCR terminé ! Le texte a été copié dans le formulaire ci-dessus.</p>}
      </div>
    </div>
  );
};

export default ImportPage;
