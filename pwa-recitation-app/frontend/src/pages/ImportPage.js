import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createWorker } from 'tesseract.js';
import TheatreParser from '../components/TheatreParser';

const ImportPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'individual',
    reviewers: [],
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  const { title, content, type, reviewers } = formData;

  const onManualChange = (e) => {
    const { name, value, type: inputType, checked, options } = e.target;
    if (name === 'reviewers') {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData({ ...formData, reviewers: selectedOptions });
    } else {
      setFormData({
        ...formData,
        [name]: inputType === 'checkbox' ? (checked ? 'theatre' : 'individual') : value,
      });
    }
    setError('');
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Le titre et le contenu sont obligatoires.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/texts', {
        ...formData,
        title: title.trim(),
        content: content.trim()
      });
      setSuccess('Texte importé avec succès !');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Erreur lors de l\'importation. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onPdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setError('');
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    
    setLoading(true);
    setError('');
    
    const formDataObj = new FormData();
    formDataObj.append('pdfFile', pdfFile);
    
    try {
      await api.post('/texts/upload/pdf', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('PDF importé avec succès !');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Erreur lors de l\'upload du PDF.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOcr = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    setOcrStatus('Initialisation...');
    setOcrProgress(0);
    setError('');
    
    try {
      const worker = await createWorker({
        logger: m => {
          setOcrStatus(m.status);
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      await worker.loadLanguage('fra');
      await worker.initialize('fra');
      const { data: { text } } = await worker.recognize(imageFile);
      setOcrStatus('Terminé !');

      // Populate the manual form with the OCR result
      setFormData(prev => ({
        ...prev,
        title: imageFile.name.replace(/\.[^/.]+$/, ""),
        content: text,
      }));
      
      setActiveTab('manual');
      await worker.terminate();
    } catch (err) {
      setError('Erreur lors de l\'extraction du texte.');
      setOcrStatus('');
      console.error(err);
    }
  };

  const clearForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'individual',
    });
    setError('');
    setSuccess('');
    setPdfFile(null);
    setOcrStatus('');
    setOcrProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📝 Importer un Nouveau Texte</h1>
        <p className="text-gray-600">Ajoutez vos textes et pièces de théâtre pour commencer à vous entraîner</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card mb-6">
          <div className="flex items-center text-green-600">
            <span className="text-2xl mr-2">✅</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card mb-6">
          <div className="flex items-center text-red-600">
            <span className="text-2xl mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ✏️ Saisie manuelle
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pdf'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📄 Import PDF
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'ocr'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📷 Reconnaissance OCR
          </button>
        </div>

        {/* Manual Input Tab */}
        {activeTab === 'manual' && (
          <form onSubmit={onManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Titre du texte *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={onManualChange}
                  className="form-input"
                  placeholder="Ex: Roméo et Juliette - Acte I"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de texte</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={type === 'individual'}
                      onChange={onManualChange}
                      className="mr-2"
                    />
                    📝 Texte individuel
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="theatre"
                      checked={type === 'theatre'}
                      onChange={onManualChange}
                      className="mr-2"
                    />
                    🎭 Pièce de théâtre
                  </label>
                </div>
              </div>
            </div>

            {type === 'theatre' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reviewers">
                  Inviter des utilisateurs à réviser
                </label>
                <select
                  multiple
                  id="reviewers"
                  name="reviewers"
                  value={reviewers}
                  onChange={onManualChange}
                  className="form-input"
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Maintenez Ctrl (ou Cmd sur Mac) pour en sélectionner plusieurs.
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="content">
                Contenu du texte *
              </label>
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={onManualChange}
                className="form-textarea"
                rows="15"
                placeholder={type === 'theatre' 
                  ? "PERSONNAGE 1: Réplique...\nPERSONNAGE 2: Autre réplique...\n\n(Didascalies entre parenthèses)" 
                  : "Copiez-collez ou tapez votre texte ici..."
                }
                required
              />
              <div className="text-sm text-gray-500 mt-2">
                {content.length} caractères
                {type === 'theatre' && (
                  <span className="ml-4">
                    💡 Tip: Utilisez le format "PERSONNAGE: réplique" pour les dialogues
                  </span>
                )}
              </div>
            </div>

            {/* Theatre Parser Component - only show for theatre type */}
            {type === 'theatre' && content.trim() && (
              <div className="border-t pt-6">
                <TheatreParser 
                  content={content}
                  onParseComplete={(result) => {
                    // Could add feedback here about parsing success
                    console.log('Parse completed:', result);
                  }}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="loading mr-2"></div>
                    Importation...
                  </span>
                ) : (
                  '💾 Importer le texte'
                )}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="btn btn-secondary"
              >
                🗑️ Effacer
              </button>
            </div>
          </form>
        )}

        {/* PDF Upload Tab */}
        {activeTab === 'pdf' && (
          <div className="space-y-6">
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Importer depuis un fichier PDF</h3>
              <p className="text-gray-600 mb-4">
                Sélectionnez un fichier PDF contenant votre texte
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={onPdfFileChange}
                className="mb-4"
              />
              {pdfFile && (
                <div className="text-sm text-gray-600 mb-4">
                  Fichier sélectionné: {pdfFile.name}
                </div>
              )}
              <button
                onClick={handlePdfUpload}
                disabled={!pdfFile || loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="loading mr-2"></div>
                    Upload en cours...
                  </span>
                ) : (
                  '📤 Importer le PDF'
                )}
              </button>
            </div>
          </div>
        )}

        {/* OCR Tab */}
        {activeTab === 'ocr' && (
          <div className="space-y-6">
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-lg font-semibold mb-2">Extraction de texte par OCR</h3>
              <p className="text-gray-600 mb-4">
                Prenez une photo ou sélectionnez une image contenant du texte
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleOcr}
                className="mb-4"
              />
              
              {ocrStatus && ocrStatus !== 'Terminé !' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">
                    Statut: {ocrStatus}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {ocrProgress}% complété
                  </div>
                </div>
              )}
              
              {ocrStatus === 'Terminé !' && (
                <div className="text-green-600 font-medium">
                  ✅ OCR terminé ! Le texte a été copié dans l'onglet "Saisie manuelle"
                </div>
              )}
            </div>
            
            <div className="card">
              <h4 className="font-semibold mb-2">💡 Conseils pour une meilleure reconnaissance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Utilisez des images nettes et bien éclairées</li>
                <li>• Assurez-vous que le texte est lisible</li>
                <li>• Évitez les angles et la distorsion</li>
                <li>• Les images en haute résolution donnent de meilleurs résultats</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
