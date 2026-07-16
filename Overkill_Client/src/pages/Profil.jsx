import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

function Profil() {
    const [ user, setUser ] = useState(null)
    const [ activeTab, setActiveTab ] = useState('cv')

    useEffect( () => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user')
        setUser(null);
        window.location.href = '/'
    }

    // Liste de CVs temporaire (à remplacer par l'appel API plus tard)
    const [cvList, setCvList] = useState([
        { id: 1, name: 'CV_Dev_Fullstack.pdf', date: '12/12/2026' },
        { id: 2, name: 'CV_React_Tailwind.pdf', date: '05/10/2026' },
        { id: 3, name: 'CV_General.pdf', date: '01/01/2026' },
    ])

    return (
        <div className="min-h-screen flex flex-col bg-[#faf7f4] text-[#171717]">
            <Header user={user} onLogout={handleLogout} />

            <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
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
                        {user ? `${user.firstname} ${user.lastname}` : 'Prénom Nom'}
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        {user?.email || 'mail@domain.com'}
                    </p>
                </section>

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

                <div className="mt-10">
                    {activeTab === 'cv' && (
                        <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-200">
                            <div className="flex flex-col items-center justify-center p-6">
                                <label className="group flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-3xl bg-[#d2915c] p-6 text-center text-white shadow-lg transition hover:scale-105 hover:bg-[#b87a48]">
                                    <svg className="h-16 w-16 transition group-hover:translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="mt-4 text-xl font-bold">Déposer Mon CV</span>
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                                </label>
                            </div>

                            <div className="flex flex-col items-center p-6 md:pl-10">
                                <h3 className="text-lg font-bold text-gray-800">Derniers CV</h3>

                                <div className="mt-6 flex w-full max-w-sm flex-col gap-4">
                                    {cvList.map((cv) => (
                                        <div
                                            key={cv.id}
                                            className="flex items-center gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm ring-1 ring-black/5"
                                        >
                                            <div className="overflow-hidden">
                                                <p className="truncate text-sm font-bold text-gray-800">{cv.name}</p>
                                                <p className="text-xs text-gray-400">{cv.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="py-12 text-center text-gray-500">
                            // TODO
                            Section Mes Skills (À venir)
                        </div>
                    )}

                    {activeTab === 'candidatures' && (
                        <div className="py-12 text-center text-gray-500">
                            // TODO
                            Section Mes Candidatures (À venir)
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="py-12 text-center text-gray-500">
                            // TODO
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