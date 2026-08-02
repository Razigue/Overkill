import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminPanel() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // 1. Récupération de l'utilisateur connecté depuis le localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            navigate('/');
        }
    }, [navigate]);

    // 2. Gestion de la déconnexion
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    // 3. Déclenchement du scraping n8n
    const handleTriggerScraping = async () => {
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8000/api/admin/trigger-scraping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue lors du déclenchement.');
            }

            setStatus({
                type: 'success',
                message: data.message || 'Workflow déclenché avec succès ! Les données sont traitées en arrière-plan par n8n.'
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'Impossible de joindre le serveur.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#faf7f4] text-[#171717]">
            <Header user={user} onLogout={handleLogout} />

            <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {/* En-tête du Panel Admin */}
                <section className="text-center">
                    <h1 className="text-4xl font-black text-black">Panneau d'Administration</h1>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        Gestion des automatisations, webhooks et collecte d'offres d'emploi.
                    </p>
                </section>

                {/* Séparateur au style de la DA */}
                <div className="mt-8 border-y border-[#d2915c]/40 py-2" />

                {/* Section d'action */}
                <div className="mt-10 mx-auto max-w-3xl space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200/80 transition hover:shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <h2 className="text-xl font-bold text-gray-900">Scraping WeLoveDevs</h2>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Déclenche le workflow n8n pour récupérer et insérer les dernières opportunités.
                                </p>
                            </div>

                            <button
                                onClick={handleTriggerScraping}
                                disabled={loading}
                                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow transition-all ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#d2915c] hover:bg-[#b87a48] active:scale-95'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Lancement...
                                    </span>
                                ) : (
                                    'Lancer le Scraping'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notification claire & visuelle */}
                    {status.message && (
                        <div
                            className={`rounded-2xl p-4 text-sm font-semibold shadow-sm border transition-all ${
                                status.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {status.type === 'success' ? (
                                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <div>
                                    <p className="font-bold">
                                        {status.type === 'success' ? 'Opération réussie' : 'Erreur'}
                                    </p>
                                    <p className="mt-0.5 font-medium">{status.message}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}