import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import eyeIcon from '../assets/icons/eye.svg'
import eyeOffIcon from '../assets/icons/eye-off.svg'
import userPlusIcon from '../assets/icons/user-plus.svg'
import lockIcon from '../assets/icons/lock.svg'
import externalLinkIcon from '../assets/icons/external-link.svg'
import trashIcon from '../assets/icons/trash-2.svg'
import { deleteApplication, listApplications } from '../services/applications'

const applicationDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
})

function formatApplicationDate(value) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Date inconnue' : applicationDateFormatter.format(date)
}


function Profil() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('cv')
    const [cvList, setCvList] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [notification, setNotification] = useState(null)
    const [cvToDelete, setCvToDelete] = useState(null)
    const [isDeletingCv, setIsDeletingCv] = useState(false)
    const [skillsList, setSkillsList] = useState([])
    const [newSkillName, setNewSkillName] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [visiblePasswordField, setVisiblePasswordField] = useState(null)
    const [passwordFeedback, setPasswordFeedback] = useState(null)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isRevokingSessions, setIsRevokingSessions] = useState(false)
    const [sessionFeedback, setSessionFeedback] = useState(null)
    const [isExportingData, setIsExportingData] = useState(false)
    const [isDeletionActionPending, setIsDeletionActionPending] = useState(false)
    const [showDeletionConfirmation, setShowDeletionConfirmation] = useState(false)
    const [privacyFeedback, setPrivacyFeedback] = useState(null)
    const [profileFirstName, setProfileFirstName] = useState('')
    const [profileLastName, setProfileLastName] = useState('')
    const [profileEmail, setProfileEmail] = useState('')
    const [profileCurrentPassword, setProfileCurrentPassword] = useState('')
    const [profileFeedback, setProfileFeedback] = useState(null)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [applications, setApplications] = useState([])
    const [applicationsStatus, setApplicationsStatus] = useState('idle')
    const [applicationToRemove, setApplicationToRemove] = useState(null)
    const [applicationRemovalStatus, setApplicationRemovalStatus] = useState('idle')
    const [applicationRemovalError, setApplicationRemovalError] = useState('')
    const applicationRemovalTriggerRef = useRef(null)

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
            setProfileFirstName(parsedUser.firstname || '');
            setProfileLastName(parsedUser.lastname || '');
            setProfileEmail(parsedUser.email || '');
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

    const fetchApplications = async (signal) => {
        try {
            const data = await listApplications(signal)
            setApplications(data)
            setApplicationsStatus('success')
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erreur lors de la récupération des candidatures', error)
                setApplicationsStatus('error')
            }
        }
    }


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


    useEffect(() => {
        if (isAdmin || activeTab !== 'candidatures') return undefined

        const controller = new AbortController()
        listApplications(controller.signal)
            .then((data) => {
                setApplications(data)
                setApplicationsStatus('success')
            })
            .catch((error) => {
                if (error.name === 'AbortError') return
                console.error('Erreur lors de la récupération des candidatures', error)
                setApplicationsStatus('error')
            })

        return () => controller.abort()
    }, [activeTab, isAdmin])

    const openApplicationRemoval = (application) => {
        applicationRemovalTriggerRef.current = document.activeElement
        setApplicationToRemove(application)
        setApplicationRemovalStatus('idle')
        setApplicationRemovalError('')
    }

    const closeApplicationRemoval = () => {
        if (applicationRemovalStatus === 'saving') return

        setApplicationToRemove(null)
        setApplicationRemovalStatus('idle')
        setApplicationRemovalError('')
        window.requestAnimationFrame(() => applicationRemovalTriggerRef.current?.focus())
    }

    const confirmApplicationRemoval = async () => {
        if (!applicationToRemove || applicationRemovalStatus === 'saving') return

        const applicationId = applicationToRemove.id
        setApplicationRemovalStatus('saving')
        setApplicationRemovalError('')

        try {
            await deleteApplication(applicationId)
            setApplications((currentApplications) => (
                currentApplications.filter((application) => application.id !== applicationId)
            ))
            setApplicationToRemove(null)
            setApplicationRemovalStatus('idle')
            window.requestAnimationFrame(() => {
                document.getElementById('applications-list-title')?.focus()
            })
        } catch (error) {
            setApplicationRemovalStatus('error')
            setApplicationRemovalError(error.message)
        }
    }

    // 4. Déconnexion
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/', { replace: true });
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (isChangingPassword) return;

        setPasswordFeedback(null);

        if (newPassword.length < 8) {
            setPasswordFeedback({ type: 'error', message: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
            return;
        }

        if (newPassword !== passwordConfirmation) {
            setPasswordFeedback({ type: 'error', message: 'La confirmation ne correspond pas au nouveau mot de passe.' });
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordFeedback({ type: 'error', message: 'Choisissez un mot de passe différent de l’actuel.' });
            return;
        }

        setIsChangingPassword(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/me/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = data.error || data.violations?.[0]?.title || 'Le mot de passe n’a pas pu être modifié. Vérifiez les informations saisies.';
                setPasswordFeedback({ type: 'error', message });
                return;
            }

            setCurrentPassword('');
            setNewPassword('');
            setPasswordConfirmation('');
            setVisiblePasswordField(null);
            setPasswordFeedback({ type: 'success', message: data.message || 'Votre mot de passe a bien été modifié.' });
        } catch {
            setPasswordFeedback({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        if (isUpdatingProfile) return;

        const firstName = profileFirstName.trim();
        const lastName = profileLastName.trim();
        const email = profileEmail.trim().toLowerCase();
        setProfileFeedback(null);

        if (!firstName || !lastName || !email || !profileCurrentPassword) {
            setProfileFeedback({ type: 'error', message: 'Complétez tous les champs pour enregistrer vos informations.' });
            return;
        }

        setIsUpdatingProfile(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/me/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    currentPassword: profileCurrentPassword
                })
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = data.error || data.violations?.[0]?.title || 'Vos informations n’ont pas pu être modifiées. Vérifiez les champs saisis.';
                setProfileFeedback({ type: 'error', message });
                return;
            }

            setProfileCurrentPassword('');
            setVisiblePasswordField(null);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            setProfileFeedback({ type: 'success', message: data.message || 'Vos informations personnelles ont bien été modifiées.' });

            if (data.requiresReauthentication) {
                window.setTimeout(handleLogout, 1800);
            }
        } catch {
            setProfileFeedback({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleRevokeAllSessions = async () => {
        if (isRevokingSessions) return;

        setIsRevokingSessions(true);
        setSessionFeedback(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/me/sessions/revoke', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setSessionFeedback(data.error || 'Impossible de déconnecter vos appareils. Réessayez.');
                return;
            }

            handleLogout();
        } catch {
            setSessionFeedback('Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.');
        } finally {
            setIsRevokingSessions(false);
        }
    };

    const handleExportData = async () => {
        if (isExportingData) return;

        setIsExportingData(true);
        setPrivacyFeedback(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/me/data-export', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setPrivacyFeedback({ type: 'error', message: data.error || 'Votre export n’a pas pu être préparé. Réessayez.' });
                return;
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `overkill-donnees-personnelles-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            URL.revokeObjectURL(downloadUrl);
            setPrivacyFeedback({ type: 'success', message: 'Votre export a été téléchargé au format JSON.' });
        } catch {
            setPrivacyFeedback({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' });
        } finally {
            setIsExportingData(false);
        }
    };

    const handleRequestDataDeletion = async () => {
        if (isDeletionActionPending) return;

        setIsDeletionActionPending(true);
        setPrivacyFeedback(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/me/data-deletion-request', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setPrivacyFeedback({ type: 'error', message: data.error || 'Votre compte n’a pas pu être supprimé. Réessayez.' });
                return;
            }

            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            navigate('/', { replace: true, state: { accountDeleted: true } });
        } catch {
            setPrivacyFeedback({ type: 'error', message: 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.' });
        } finally {
            setIsDeletionActionPending(false);
        }
    };
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
                setNotification({
                    type: 'success',
                    message: data.message || 'CV téléversé avec succès !',
                });
                setCvList((prevList) => [data.cv, ...prevList]);
            } else {
                setNotification({
                    type: 'error',
                    message: data.error || "Erreur lors de l'upload du CV.",
                });
            }
        } catch (error) {
            console.error("Erreur API :", error);
            setNotification({
                type: 'error',
                message: "Impossible d'envoyer le CV. Vérifiez votre connexion puis réessayez.",
            });
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleDeleteCv = async () => {
        if (!cvToDelete || isDeletingCv) return;

        setIsDeletingCv(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/cvs/' + cvToDelete.id, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Le CV n’a pas pu être supprimé.');
            }

            setCvList((currentList) => currentList.filter((cv) => cv.id !== cvToDelete.id));
            setNotification({ type: 'success', message: 'CV supprimé avec succès.' });
            setCvToDelete(null);
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.message || 'Le CV n’a pas pu être supprimé.',
            });
        } finally {
            setIsDeletingCv(false);
        }
    };

    const displayName = user?.firstname && user?.lastname
        ? user.firstname + ' ' + user.lastname
        : user?.email || 'Administrateur'
    const initials = user?.firstname || user?.lastname
        ? ((user?.firstname?.[0] || '') + (user?.lastname?.[0] || '')).toUpperCase()
        : (user?.email?.[0] || 'A').toUpperCase()
    const tabs = [
        { id: 'cv', label: 'Mes CV' },
        { id: 'skills', label: 'Compétences' },
        { id: 'candidatures', label: 'Candidatures' },
        { id: 'settings', label: 'Paramètres' },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-[#faf7f4] text-[#171717]">
            <Header user={user} onLogout={handleLogout} />
            <Toast notification={notification} onDismiss={() => setNotification(null)} />

            <main className="flex-1">
                <section className="border-b border-black/10 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                        <p className="text-sm font-bold uppercase tracking-wide text-[#a85f2d]">{isAdmin ? 'Administration' : 'Espace personnel'}</p>
                        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-black text-white sm:h-20 sm:w-20 sm:text-2xl" aria-hidden="true">
                                    {isAdmin ? (
                                        <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.62-8.02A11.96 11.96 0 0 1 12 2.94a11.96 11.96 0 0 1-8.62 3.04A12.02 12.02 0 0 0 3 9c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.04-.13-2.05-.38-3.02Z" /></svg>
                                    ) : initials}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="truncate text-3xl font-black tracking-[-0.02em] text-black sm:text-4xl">{displayName}</h1>
                                    <p className="mt-1 truncate text-sm font-medium text-gray-600">{user?.email || 'admin@domain.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    {isAdmin ? (
                        <section className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="admin-space-title">
                            <div className="bg-black p-7 text-white sm:p-10">
                                <span className="inline-flex rounded-full bg-[#d2915c] px-3 py-1 text-xs font-bold text-black">Accès administrateur</span>
                                <h2 id="admin-space-title" className="mt-6 max-w-md text-3xl font-black leading-tight tracking-[-0.02em] sm:text-4xl">Le poste de contrôle d’Overkill.</h2>
                            </div>
                            <div className="flex flex-col items-start justify-center p-7 sm:p-10">
                                <h3 className="text-xl font-black text-black">Gestion du site et automatisations</h3>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">Gérez les workflows et le scraping des offres d’emploi depuis le panneau d’administration.</p>
                                <Link to="/admin" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#d2915c] px-6 text-sm font-bold text-black transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d2915c] focus:ring-offset-2">Ouvrir le panneau admin <span className="ml-2" aria-hidden="true">→</span></Link>
                            </div>
                        </section>
                    ) : (
                        <div className="grid items-start gap-7 lg:grid-cols-[15rem_minmax(0,1fr)]">
                            <nav className="-mx-4 overflow-x-auto border-y border-gray-200 bg-white px-4 lg:mx-0 lg:rounded-xl lg:border" aria-label="Sections du profil">
                                <div className="flex min-w-max py-2 lg:min-w-0 lg:flex-col lg:p-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={'min-h-11 border-b px-4 text-left text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#d2915c] lg:w-full lg:rounded-lg lg:border-b-0 lg:border-l ' + (activeTab === tab.id ? 'border-black bg-[#ebc09d]/35 text-black' : 'border-transparent text-gray-600 hover:bg-[#faf7f4] hover:text-black')}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </nav>

                            <section className="min-w-0">
                                {activeTab === 'cv' && (
                                    <div className="space-y-6">
                                        <div><h2 className="text-2xl font-black tracking-[-0.02em] text-black sm:text-3xl">Mes CV</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Ajoutez un document puis retrouvez rapidement les versions déjà enregistrées.</p></div>
                                        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white xl:grid-cols-[0.9fr_1.1fr]">
                                            <label className={'group flex min-h-72 cursor-pointer flex-col items-center justify-center border-b border-gray-200 bg-[#fcfbfa] px-6 py-10 text-center transition focus-within:bg-[#f2dccb]/45 hover:bg-[#f2dccb]/45 xl:border-b-0 xl:border-r ' + (isUploading ? 'cursor-wait opacity-70' : '')}>
                                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition group-hover:bg-[#a85f2d]" aria-hidden="true">
                                                    {isUploading ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" /> : <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4" /></svg>}
                                                </span>
                                                <span className="mt-5 text-xl font-black text-black">{isUploading ? 'Envoi en cours…' : 'Déposer un nouveau CV'}</span>
                                                <span className="mt-2 text-sm leading-6 text-gray-600">PDF, DOC ou DOCX</span>
                                                <span className="mt-5 rounded-xl bg-[#d2915c] px-5 py-3 text-sm font-bold text-black transition group-hover:bg-black group-hover:text-white">Choisir un fichier</span>
                                                <input type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={isUploading} />
                                            </label>
                                            <div className="p-5 sm:p-7">
                                                <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-4"><h3 className="text-lg font-black text-black">Documents enregistrés</h3><span className="text-sm font-medium text-gray-500">{cvList.length}</span></div>
                                                {cvList.length === 0 ? (
                                                    <div className="flex min-h-52 flex-col items-center justify-center text-center"><p className="font-bold text-black">Aucun CV pour le moment</p><p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">Votre prochain document apparaîtra ici après l’envoi.</p></div>
                                                ) : (
                                                    <div>
                                                        {cvList.map((cv) => (
                                                            <div key={cv.id} className="border-b border-gray-200 last:border-b-0">
                                                                <div className="flex items-center gap-2 py-3">
                                                                    <a href={'http://localhost:8000' + cv.filePath} target="_blank" rel="noopener noreferrer" className="group flex min-h-14 min-w-0 flex-1 items-center gap-4 rounded-lg px-1 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d2915c]" aria-label={'Ouvrir ' + cv.originalName + ' dans un nouvel onglet'}>
                                                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f2dccb] text-xs font-black text-[#75421d]">CV</span>
                                                                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-black group-hover:text-[#8a542d]">{cv.originalName}</span><span className="mt-1 block text-xs text-gray-500">{cv.uploadedAt}</span></span>
                                                                        <img src={externalLinkIcon} alt="" className="h-5 w-5 shrink-0 opacity-45 transition group-hover:opacity-100" aria-hidden="true" />
                                                                    </a>
                                                                    <button type="button" onClick={() => setCvToDelete(cv)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-700 transition hover:bg-red-50 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-200" aria-label={'Supprimer ' + cv.originalName}>
                                                                        <img src={trashIcon} alt="" className="h-5 w-5" aria-hidden="true" />
                                                                    </button>
                                                                </div>
                                                                {cvToDelete?.id === cv.id && (
                                                                    <div className="mb-3 border-y border-[#e3b995] bg-[#fffaf6] px-4 py-4">
                                                                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                                                            <div className="min-w-0">
                                                                                <p className="text-sm font-medium text-black">Supprimer ce CV ?</p>
                                                                                <p className="mt-1 truncate text-xs text-[#68482f]">{cv.originalName}</p>
                                                                            </div>
                                                                            <div className="flex shrink-0 gap-2">
                                                                                <button type="button" onClick={() => setCvToDelete(null)} disabled={isDeletingCv} className="min-h-9 rounded-lg border border-black/15 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-black/40 hover:text-black focus:outline-none focus:ring-2 focus:ring-[#d2915c]/25 disabled:opacity-50">Conserver</button>
                                                                                <button type="button" onClick={handleDeleteCv} disabled={isDeletingCv} className="min-h-9 rounded-lg bg-black px-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-[#d2915c]/25 disabled:cursor-wait disabled:opacity-70">{isDeletingCv ? 'Suppression…' : 'Supprimer'}</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-6">
                                        <div><h2 className="text-2xl font-black tracking-[-0.02em] text-black sm:text-3xl">Compétences</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Renseignez les savoir-faire qui décrivent le mieux votre profil.</p></div>
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
                                            <form onSubmit={handleAddSkill} className="flex flex-col gap-3 sm:flex-row">
                                                <label className="min-w-0 flex-1"><span className="mb-2 block text-sm font-semibold text-gray-700">Nouvelle compétence</span><input type="text" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="Ex. Symfony, React, Docker…" className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-medium outline-none transition focus:border-[#c47f48] focus:ring-4 focus:ring-[#d2915c]/10" /></label>
                                                <button type="submit" className="min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 sm:self-end">Ajouter</button>
                                            </form>
                                            <div className="mt-7 border-t border-gray-200 pt-6">
                                                {skillsList.length === 0 ? <div className="py-10 text-center"><p className="font-bold text-black">Aucune compétence ajoutée</p><p className="mt-2 text-sm leading-6 text-gray-600">Commencez par saisir une compétence dans le champ ci-dessus.</p></div> : (
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {skillsList.map((skill) => (
                                                            <span key={skill.id} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e3b995] bg-[#fbf2eb] py-1.5 pl-4 pr-2 text-sm font-semibold text-[#75421d]">{skill.name}<button type="button" onClick={() => handleRemoveSkill(skill.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[#8a542d] hover:bg-white hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-[#d2915c]" aria-label={'Supprimer la compétence ' + skill.name}>×</button></span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'candidatures' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-[-0.02em] text-black sm:text-3xl">Mes candidatures</h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Retrouvez les offres pour lesquelles vous avez confirmé avoir postulé.</p>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                            <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-7">
                                                <h3 id="applications-list-title" tabIndex="-1" className="text-lg font-black text-black outline-none">Offres suivies</h3>
                                                {applicationsStatus === 'success' && (
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {applications.length} candidature{applications.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {(applicationsStatus === 'idle' || applicationsStatus === 'loading') && (
                                                <div className="space-y-4 p-5 sm:p-7" role="status" aria-label="Chargement des candidatures">
                                                    {[0, 1].map((item) => (
                                                        <div key={item} className="animate-pulse border-b border-gray-100 pb-4 last:border-0 motion-reduce:animate-none">
                                                            <div className="h-4 w-2/3 rounded bg-gray-200" />
                                                            <div className="mt-3 h-3 w-1/3 rounded bg-gray-100" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {applicationsStatus === 'error' && (
                                                <div className="px-5 py-12 text-center sm:px-7">
                                                    <p className="font-bold text-black">Impossible de charger vos candidatures</p>
                                                    <p className="mt-2 text-sm leading-6 text-gray-600">Vérifiez votre connexion puis réessayez.</p>
                                                    <button type="button" onClick={() => { setApplicationsStatus('loading'); fetchApplications() }} className="mt-5 min-h-11 rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20">Réessayer</button>
                                                </div>
                                            )}

                                            {applicationsStatus === 'success' && applications.length === 0 && (
                                                <div className="px-5 py-12 text-center sm:px-7">
                                                    <p className="font-bold text-black">Aucune candidature enregistrée</p>
                                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">Ouvrez une offre, cliquez sur « Postuler sur le site d’origine », puis confirmez votre envoi pour la retrouver ici.</p>
                                                    <Link to="/feed" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20">Parcourir les offres</Link>
                                                </div>
                                            )}

                                            {applicationsStatus === 'success' && applications.length > 0 && (
                                                <div className="divide-y divide-gray-200">
                                                    {applications.map((application) => {
                                                        const offer = application.offer
                                                        const location = [offer?.city, offer?.isRemote].filter(Boolean).join(' · ') || 'Localisation non renseignée'
                                                        return (
                                                            <article key={application.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-7">
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-[#8a542d]">Candidature envoyée le {formatApplicationDate(application.createdAt)}</p>
                                                                    <h4 className="mt-2 break-words text-lg font-black leading-snug text-black">{offer?.title || 'Offre indisponible'}</h4>
                                                                    <p className="mt-1 text-sm leading-6 text-gray-600">{offer?.company || 'Entreprise non renseignée'} · {location}</p>
                                                                    {offer?.contract && <span className="mt-3 inline-flex rounded-md bg-[#fbf2eb] px-2.5 py-1 text-xs font-bold text-[#75421d]">{offer.contract}</span>}
                                                                </div>
                                                                <div className="flex shrink-0 flex-col gap-2">
                                                                    {offer?.externalUrl && <a href={offer.externalUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-bold text-black transition hover:border-black hover:bg-[#faf7f4] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20">Revoir l’offre <img src={externalLinkIcon} alt="" className="h-4 w-4" /></a>}
                                                                    <button type="button" onClick={() => openApplicationRemoval(application)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:border-red-700 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100" aria-label={`Retirer ${offer?.title || 'cette offre'} de mes candidatures`}>
                                                                        Retirer du suivi
                                                                    </button>
                                                                </div>
                                                            </article>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-[-0.02em] text-black sm:text-3xl">Paramètres du compte</h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Gérez la sécurité de votre compte et votre session en cours.</p>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                            <section className="grid gap-7 p-5 sm:p-7 xl:grid-cols-[minmax(0,0.75fr)_minmax(22rem,1.25fr)]" aria-labelledby="identity-settings-title">
                                                <div>
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2dccb] text-[#75421d]" aria-hidden="true">
                                                        <img src={userPlusIcon} alt="" className="h-5 w-5" />
                                                    </span>
                                                    <h3 id="identity-settings-title" className="mt-4 text-xl font-black text-black">Informations personnelles</h3>
                                                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">Mettez à jour votre identité et votre adresse de connexion. Votre mot de passe actuel protège cette modification.</p>
                                                </div>

                                                <form onSubmit={handleProfileUpdate} className="min-w-0">
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <label className="block min-w-0">
                                                            <span className="mb-2 block text-sm font-semibold text-gray-700">Prénom</span>
                                                            <input type="text" value={profileFirstName} onChange={(event) => setProfileFirstName(event.target.value)} required maxLength={80} autoComplete="given-name" className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base font-medium outline-none transition focus:border-[#c47f48] focus:ring-4 focus:ring-[#d2915c]/10" />
                                                        </label>
                                                        <label className="block min-w-0">
                                                            <span className="mb-2 block text-sm font-semibold text-gray-700">Nom</span>
                                                            <input type="text" value={profileLastName} onChange={(event) => setProfileLastName(event.target.value)} required maxLength={80} autoComplete="family-name" className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base font-medium outline-none transition focus:border-[#c47f48] focus:ring-4 focus:ring-[#d2915c]/10" />
                                                        </label>
                                                    </div>
                                                    <label className="mt-4 block min-w-0">
                                                        <span className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail</span>
                                                        <input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} required maxLength={180} autoComplete="email" className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base font-medium outline-none transition focus:border-[#c47f48] focus:ring-4 focus:ring-[#d2915c]/10" />
                                                    </label>
                                                    <div className="mt-4">
                                                        <ProfilePasswordField
                                                            id="profile-current-password"
                                                            label="Mot de passe actuel"
                                                            value={profileCurrentPassword}
                                                            onChange={setProfileCurrentPassword}
                                                            visible={visiblePasswordField === 'profile'}
                                                            onToggle={() => setVisiblePasswordField((field) => field === 'profile' ? null : 'profile')}
                                                            autoComplete="current-password"
                                                        />
                                                    </div>

                                                    {profileFeedback && (
                                                        <p className={'mt-4 rounded-xl px-4 py-3 text-sm font-semibold ' + (profileFeedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')} role={profileFeedback.type === 'error' ? 'alert' : 'status'} aria-live="polite">
                                                            {profileFeedback.message}
                                                        </p>
                                                    )}

                                                    <button type="submit" disabled={isUpdatingProfile} className="mt-5 min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-60">
                                                        {isUpdatingProfile ? 'Enregistrement…' : 'Enregistrer mes informations'}
                                                    </button>
                                                </form>
                                            </section>

                                            <section className="grid gap-7 border-t border-gray-200 p-5 sm:p-7 xl:grid-cols-[minmax(0,0.75fr)_minmax(22rem,1.25fr)]" aria-labelledby="password-settings-title">
                                                <div>
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2dccb] text-[#75421d]" aria-hidden="true">
                                                        <img src={lockIcon} alt="" className="h-5 w-5" />
                                                    </span>
                                                    <h3 id="password-settings-title" className="mt-4 text-xl font-black text-black">Modifier le mot de passe</h3>
                                                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">Saisissez votre mot de passe actuel, puis choisissez-en un nouveau d’au moins 8 caractères.</p>
                                                </div>

                                                <form onSubmit={handlePasswordChange} className="min-w-0">
                                                    <ProfilePasswordField
                                                        id="current-password"
                                                        label="Mot de passe actuel"
                                                        value={currentPassword}
                                                        onChange={setCurrentPassword}
                                                        visible={visiblePasswordField === 'current'}
                                                        onToggle={() => setVisiblePasswordField((field) => field === 'current' ? null : 'current')}
                                                        autoComplete="current-password"
                                                    />
                                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                        <ProfilePasswordField
                                                            id="new-password"
                                                            label="Nouveau mot de passe"
                                                            value={newPassword}
                                                            onChange={setNewPassword}
                                                            visible={visiblePasswordField === 'new'}
                                                            onToggle={() => setVisiblePasswordField((field) => field === 'new' ? null : 'new')}
                                                            autoComplete="new-password"
                                                            minLength={8}
                                                        />
                                                        <ProfilePasswordField
                                                            id="confirm-password"
                                                            label="Confirmer le mot de passe"
                                                            value={passwordConfirmation}
                                                            onChange={setPasswordConfirmation}
                                                            visible={visiblePasswordField === 'confirmation'}
                                                            onToggle={() => setVisiblePasswordField((field) => field === 'confirmation' ? null : 'confirmation')}
                                                            autoComplete="new-password"
                                                            minLength={8}
                                                        />
                                                    </div>

                                                    {passwordFeedback && (
                                                        <p
                                                            className={'mt-4 rounded-xl px-4 py-3 text-sm font-semibold ' + (passwordFeedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}
                                                            role={passwordFeedback.type === 'error' ? 'alert' : 'status'}
                                                            aria-live="polite"
                                                        >
                                                            {passwordFeedback.message}
                                                        </p>
                                                    )}

                                                    <button type="submit" disabled={isChangingPassword} className="mt-5 min-h-12 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-60">
                                                        {isChangingPassword ? 'Modification…' : 'Modifier le mot de passe'}
                                                    </button>
                                                </form>
                                            </section>

                                            <section className="flex flex-col gap-5 border-t border-gray-200 bg-[#fcfbfa] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7" aria-labelledby="session-settings-title">
                                                <div>
                                                    <h3 id="session-settings-title" className="text-lg font-black text-black">Sécuriser toutes les sessions</h3>
                                                    <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">Révoquez les connexions actives sur tous vos appareils, y compris celui-ci. Vous devrez ensuite vous reconnecter.</p>
                                                    {sessionFeedback && <p className="mt-3 text-sm font-semibold text-red-800" role="alert">{sessionFeedback}</p>}
                                                </div>
                                                <button type="button" onClick={handleRevokeAllSessions} disabled={isRevokingSessions} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:border-red-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                                                    {isRevokingSessions ? 'Déconnexion…' : 'Déconnecter tous mes appareils'}
                                                </button>
                                            </section>
                                        </div>

                                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-labelledby="privacy-settings-title">
                                            <div className="p-5 sm:p-7">
                                                <p className="text-sm font-bold text-[#a85f2d]">Confidentialité</p>
                                                <h3 id="privacy-settings-title" className="mt-2 text-xl font-black text-black">Vos données personnelles</h3>
                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Exercez vos droits d’accès, de portabilité et de suppression depuis votre compte.</p>

                                                {privacyFeedback && (
                                                    <p className={'mt-5 rounded-xl px-4 py-3 text-sm font-semibold ' + (privacyFeedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')} role={privacyFeedback.type === 'error' ? 'alert' : 'status'} aria-live="polite">
                                                        {privacyFeedback.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-5 border-t border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                                                <div>
                                                    <h4 className="font-black text-black">Exporter mes données</h4>
                                                    <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">Téléchargez une copie structurée de votre profil, de vos CV enregistrés, compétences et offres favorites au format JSON.</p>
                                                </div>
                                                <button type="button" onClick={handleExportData} disabled={isExportingData} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-[#a96531] focus:outline-none focus:ring-4 focus:ring-[#d2915c]/20 disabled:cursor-not-allowed disabled:opacity-60">
                                                    {isExportingData ? 'Préparation…' : 'Télécharger mon export'}
                                                </button>
                                            </div>

                                            <div className="border-t border-gray-200 bg-[#fcfbfa] p-5 sm:p-7">
                                                {showDeletionConfirmation ? (
                                                    <div className="rounded-xl bg-red-50 p-4 sm:p-5">
                                                        <h4 className="font-black text-red-900">Supprimer définitivement mon compte ?</h4>
                                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">Cette action est immédiate et irréversible. Votre compte et les données personnelles qui lui sont associées seront supprimés, puis un e-mail de confirmation vous sera envoyé.</p>
                                                        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                                                            <button type="button" onClick={() => setShowDeletionConfirmation(false)} disabled={isDeletionActionPending} className="min-h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-800 transition hover:border-red-800 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-60">Conserver mon compte</button>
                                                            <button type="button" onClick={handleRequestDataDeletion} disabled={isDeletionActionPending} className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-900 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-wait disabled:opacity-60">{isDeletionActionPending ? 'Suppression en cours…' : 'Supprimer définitivement'}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <h4 className="font-black text-black">Supprimer définitivement mon compte</h4>
                                                            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">Supprimez immédiatement votre compte et les données personnelles associées. Vous recevrez un e-mail de confirmation.</p>
                                                        </div>
                                                        <button type="button" onClick={() => { setPrivacyFeedback(null); setShowDeletionConfirmation(true); }} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:border-red-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-100">
                                                            Supprimer mon compte
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            {applicationToRemove && (
                <ApplicationRemovalDialog
                    application={applicationToRemove}
                    status={applicationRemovalStatus}
                    error={applicationRemovalError}
                    onClose={closeApplicationRemoval}
                    onConfirm={confirmApplicationRemoval}
                />
            )}
        </div>
    );
}

function ApplicationRemovalDialog({ application, status, error, onClose, onConfirm }) {
    const dialogRef = useRef(null)
    const isSaving = status === 'saving'
    const offerTitle = application.offer?.title || 'cette offre'

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSaving) {
                onClose()
                return
            }
            if (event.key !== 'Tab') return

            const focusableElements = dialogRef.current?.querySelectorAll('button:not([disabled])')
            if (!focusableElements?.length) return

            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isSaving, onClose])

    return (
        <div
            className="animate-login-backdrop-in fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) onClose()
            }}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="application-removal-title"
                aria-describedby="application-removal-description"
                className="animate-login-in w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-8"
            >
                <h2 id="application-removal-title" className="text-2xl font-black tracking-[-0.02em] text-black">
                    Retirer cette candidature ?
                </h2>
                <p id="application-removal-description" className="mt-3 text-sm leading-6 text-gray-600">
                    <strong className="font-bold text-black">{offerTitle}</strong>
                    {application.offer?.company ? ` chez ${application.offer.company}` : ''} sera retirée de votre suivi Overkill. Cela n’annule pas la candidature envoyée sur le site de l’entreprise.
                </p>

                {error && (
                    <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                        {error} Vous pouvez réessayer.
                    </p>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" autoFocus onClick={onClose} disabled={isSaving} className="min-h-12 rounded-xl border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition hover:border-black hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
                        Conserver
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isSaving} className="min-h-12 rounded-xl bg-red-700 px-6 text-sm font-bold text-white transition hover:bg-red-900 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-wait disabled:opacity-70">
                        {isSaving ? 'Retrait en cours…' : 'Retirer du suivi'}
                    </button>
                </div>
            </section>
        </div>
    )
}

function ProfilePasswordField({ id, label, value, onChange, visible, onToggle, autoComplete, minLength }) {
    return (
        <label htmlFor={id} className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
            <span className="relative block">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required
                    minLength={minLength}
                    maxLength={4096}
                    autoComplete={autoComplete}
                    className="min-h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-base font-medium outline-none transition focus:border-[#c47f48] focus:ring-4 focus:ring-[#d2915c]/10"
                />
                <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#d2915c]" aria-label={visible ? `Masquer ${label.toLowerCase()}` : `Afficher ${label.toLowerCase()}`}>
                    <img src={visible ? eyeIcon : eyeOffIcon} alt="" className="h-5 w-5" />
                </button>
            </span>
        </label>
    );
}

export default Profil;
