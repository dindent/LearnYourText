import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTexts, deleteText } from '../services/localApi';

const DashboardPage = () => {
    const [texts, setTexts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTexts = async () => {
            try {
                const res = await getTexts();
                setTexts(res.data);
            } catch (err) {
                console.error('Failed to fetch texts', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTexts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce texte ?')) {
            try {
                await deleteText(id);
                setTexts(prevTexts => prevTexts.filter((text) => text._id !== id));
            } catch (err) {
                console.error('Failed to delete text', err);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Mes Textes</h1>
                    <p className="text-gray-600">Gérez vos textes et commencez une session de récitation.</p>
                </div>
                <Link to="/import" className="btn btn-primary">
                    📝 Importer un texte
                </Link>
            </div>

            <section className="card">
                {loading ? (
                    <p>Chargement des textes...</p>
                ) : texts.length === 0 ? (
                    <p>Vous n'avez aucun texte pour le moment. <Link to="/import" className="text-primary">Importez-en un</Link> pour commencer.</p>
                ) : (
                    <ul className="space-y-4">
                        {texts.map((text) => (
                            <li key={text._id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold">{text.title}</h3>
                                    <p className="text-sm text-gray-500">{text.type === 'theatre' ? 'Pièce de théâtre' : 'Texte individuel'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/recite/${text._id}`} className="btn btn-sm btn-secondary">Réciter</Link>
                                    {text.type === 'theatre' && (
                                        <Link to={`/theatre/${text._id}`} className="btn btn-sm btn-secondary">Mode Théâtre</Link>
                                    )}
                                    <button onClick={() => handleDelete(text._id)} className="btn btn-sm btn-danger">Supprimer</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;
