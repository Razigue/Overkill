import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Profil() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('cv')
    const [cvList, setCvList] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [skillsList, setSkillsList] = useState([])
    const [newSkillName, setNewSkillName] = useState('')

    // Helper pour détecter le rôle Admin (dans user ou token JWT)
    const checkIsAdmin = (userData) => {
        if (userData?.roles?.includes('ROLE_ADMIN') || userData?.role === 'ROLE_ADMIN') {
            return true;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.roles?.includes('ROLE_ADMIN') || false;
        } catch {
            return false;
        }
    };

    // 1. Récupération de l'utilisateur au chargement
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAdmin(checkIsAdmin(parsedUser));
        } else {
            navigate('/');
        }
    }, [navigate]);

    // 2. Récupération des CVs
    const fetchCvs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/cvs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCvList(data);
            }
        } catch (error) {
            console.error("Erreur serveur lors de la récupération des CVs", error);
        }
    };

    // 3. Récupération des compétences
    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/user/skills', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSkillsList(data);
            }
        } catch (error) {
            console.error("Erreur serveur lors de la récupération des skills", error);
        }
    };

    useEffect(() => {
        if (!isAdmin && activeTab === 'skills') {
            fetchSkills();
        }
    }, [activeTab, isAdmin]);

    useEffect(() => {
        if (!isAdmin && activeTab === 'cv') {
            fetchCvs();
        }
    }, [activeTab, isAdmin]);

    // 4. Déconnexion
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    // 5. Ajout de compétence
    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/user/skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newSkillName })
            });

            const data = await response.json();

            if (response.ok) {
                setSkillsList((prev) => [...prev, data.skill]);
                setNewSkillName('');
            } else {
                alert(data.error || "Erreur lors de l'ajout de la compétence.");
            }
        } catch (error) {
            console.error("Erreur API :", error);
        }
    };

    // 6. Suppression de compétence
    const handleRemoveSkill = async (skillId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/user/skills/${skillId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setSkillsList((prev) => prev.filter((skill) => skill.id !== skillId));
            }
        } catch (error) {
            console.error("Erreur API :", error);
        }
    };

    // 7. Upload de CV
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/cvs/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "CV téléversé avec succès !");
                setCvList((prevList) => [data.cv, ...prevList]);
            } else {
                alert(data.error || "Erreur lors de l'upload du CV.");
            }
        } catch (error) {
            console.error("Erreur API :", error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#faf7f4] text-[#171717]">
            <Header user={user} onLogout={handleLogout} />

            <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {/* En-tête Profil */}
                <section className="text-center">
                    <h1 className="text-4xl font-black text-black">
                        {isAdmin ? 'Profil Administrateur' : 'Mon Profil'}
                    </h1>

                    <div className="mt-6 flex justify-center">
                        <div className={`flex h-24 w-24 items-center justify-center rounded-full ${
                            isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                            {isAdmin ? (
                                <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            ) : (
                                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        {user?.firstname && user?.lastname
                            ? `${user.firstname} ${user.lastname}`
                            : user?.email || 'Administrateur'}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {user?.email || 'admin@domain.com'}
                    </p>
                </section>

                {/* VUE SPECIFIQUE ADMINISTRATEUR */}
                {isAdmin ? (
                    <div className="mt-10 mx-auto max-w-xl text-center">
                        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
                            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
                                Compte Administrateur
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Gestion du site & Outils d'automation
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                En tant qu'administrateur, vous disposez d'un accès dédié au panneau de contrôle pour gérer les workflows et le scraping d'offres d'emploi.
                            </p>
                            <Link
                                to="/admin"
                                className="inline-flex items-center justify-center rounded-xl bg-[#d2915c] px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-[#b87a48] active:scale-95"
                            >
                                Ouvrir le Panneau Admin
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* VUE CLASSIQUE CANDIDAT */
                    <>
                        {/* Barre d'onglets */}
                        <div className="mt-10 border-y border-[#d2915c]/40 py-2">
                            <nav className="flex justify-around text-center">
                                <button
                                    onClick={() => setActiveTab('cv')}
                                    className={`text-base font-bold transition ${
                                        activeTab === 'cv' ? 'text-black underline underline-offset-8 decoration-[#d2915c] decoration-2' : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    Mon CV
                                </button>
                                <button
                                    onClick={() => setActiveTab('skills')}
                                    className={`text-base font-bold transition ${
                                        activeTab === 'skills' ? 'text-black underline underline-offset-8 decoration-[#d2915c] decoration-2' : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    Mes Skills
                                </button>
                                <button
                                    onClick={() => setActiveTab('candidatures')}
                                    className={`text-base font-bold transition ${
                                        activeTab === 'candidatures' ? 'text-black underline underline-offset-8 decoration-[#d2915c] decoration-2' : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    Mes Candidatures
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`text-base font-bold transition ${
                                        activeTab === 'settings' ? 'text-black underline underline-offset-8 decoration-[#d2915c] decoration-2' : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    Paramètres
                                </button>
                            </nav>
                        </div>

                        {/* Contenu des onglets candidats */}
                        <div className="mt-10">
                            {activeTab === 'cv' && (
                                <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-200">
                                    <div className="flex flex-col items-center justify-center p-6">
                                        <label className="group flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-3xl bg-[#d2915c] p-6 text-center text-white shadow-lg transition hover:scale-105 hover:bg-[#b87a48]">
                                            <svg className="h-16 w-16 transition group-hover:translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span className="mt-4 text-xl font-bold">
                                                {isUploading ? 'Envoi en cours...' : 'Déposer Mon CV'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>

                                    <div className="flex flex-col items-center p-6 md:pl-10">
                                        <h3 className="text-lg font-bold text-gray-800">Derniers CV</h3>
                                        <div className="mt-6 flex w-full max-w-sm flex-col gap-4">
                                            {cvList.length === 0 ? (
                                                <p className="text-center text-sm text-gray-500">
                                                    Aucun CV déposé pour le moment.
                                                </p>
                                            ) : (
                                                cvList.map((cv) => (
                                                    <a
                                                        key={cv.id}
                                                        href={`http://localhost:8000${cv.filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:bg-gray-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                                                            A
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="truncate text-sm font-bold text-gray-800">
                                                                {cv.originalName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{cv.uploadedAt}</p>
                                                        </div>
                                                    </a>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="mx-auto max-w-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Gérer mes compétences</h3>
                                    <form onSubmit={handleAddSkill} className="flex gap-2 mb-8">
                                        <input
                                            type="text"
                                            value={newSkillName}
                                            onChange={(e) => setNewSkillName(e.target.value)}
                                            placeholder="Ex: Symfony, React, Docker..."
                                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-[#d2915c] focus:outline-none focus:ring-1 focus:ring-[#d2915c]"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-[#d2915c] px-6 py-2 text-sm font-bold text-white shadow transition hover:bg-[#b87a48]"
                                        >
                                            Ajouter
                                        </button>
                                    </form>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {skillsList.length === 0 ? (
                                            <p className="text-center text-sm text-gray-500">
                                                Aucune compétence ajoutée pour le moment.
                                            </p>
                                        ) : (
                                            skillsList.map((skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 border border-purple-200 shadow-sm"
                                                >
                                                    {skill.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill.id)}
                                                        className="text-purple-400 hover:text-red-500 font-bold ml-1"
                                                        title="Supprimer"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'candidatures' && (
                                <div className="py-12 text-center text-gray-500">
                                    Section Mes Candidatures (À venir)
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="py-12 text-center text-gray-500">
                                    Section Paramètres (À venir)
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Profil;