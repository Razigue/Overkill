import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Profil() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState('cv')
    const [cvList, setCvList] = useState([])
    const [isUploading, setIsUploading] = useState(false)

    // 1. Récupération de l'utilisateur depuis le localStorage au chargement
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            navigate('/');
        }
    }, [navigate]);

    // 2. Récupération de la liste des CVs depuis le Backend
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

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            setCvList(data);

        } catch (error) {
            console.error("Erreur serveur lors de la récupération des CVs", error);
        }
    };

    // On recharge la liste des CVs quand l'onglet "cv" est actif
    useEffect(() => {
        if (activeTab === 'cv') {
            fetchCvs()
        }
    }, [activeTab])

    // 3. Gestion de la déconnexion
    const handleLogout = () => {
        localStorage.removeItem('user')
        setUser(null)
        window.location.href = '/'
    }

    // 4. Fonction d'upload du fichier vers l'API
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        setIsUploading(true)
        const token = localStorage.getItem('token')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/api/cvs/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                alert(data.message || "CV téléversé avec succès !")
                setCvList((prevList) => [data.cv, ...prevList])
            } else {
                alert(data.error || "Erreur lors de l'upload du CV.")
            }
        } catch (error) {
            console.error("Erreur API :", error)
            alert("Impossible d'envoyer le fichier au serveur.")
        } finally {
            setIsUploading(false)
            event.target.value = ''
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf7f4] text-[#171717]">
            <Header user={user} onLogout={handleLogout} />

            <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {/* En-tête Profil */}
                <section className="text-center">
                    <h1 className="text-4xl font-black text-black">Mon Profil</h1>

                    <div className="mt-6 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        {user?.firstname && user?.lastname
                            ? `${user.firstname} ${user.lastname}`
                            : user?.email || 'Prénom Nom'}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {user?.email || 'Mail@mail.com'}
                    </p>
                </section>

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

                {/* Contenu de l'onglet actif */}
                <div className="mt-10">
                    {activeTab === 'cv' && (
                        <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-200">
                            {/* Colonne Gauche : Zone de Dépôt */}
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

                            {/* Colonne Droite : Liste des CVs */}
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
                        <div className="py-12 text-center text-gray-500">
                            Section Mes Skills (À venir)
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
            </main>

            <Footer />
        </div>
    )
}

export default Profil