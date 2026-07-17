import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../assets/images/Overkill_Background.png'

function Contact() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSent, setIsSent] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // TODO: Brancher ici l'envoi du formulaire de contact.
    console.log('Demande de contact', form)
    setIsSent(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4] text-[#171717]">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <section
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Contact</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.03] text-black sm:text-6xl">
                Une question ? On est là pour vous répondre.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5f5f]">
                Besoin d'aide, envie de nous partager une idée ou simplement de prendre contact ? L'équipe Overkill vous écoute.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-20">
          <aside>
            <p className="text-sm font-bold uppercase tracking-wide text-[#d2915c]">Nous joindre</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-black">Parlons de votre recherche.</h2>
            <p className="mt-5 max-w-md leading-7 text-gray-600">
              Retrouvez ici les informations utiles pour nous contacter. Ces textes sont prêts à être personnalisés avec vos coordonnées.
            </p>

            <div className="mt-8 space-y-4">
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-sm font-bold text-[#d2915c]">Email</p>
                <p className="mt-2 text-base font-bold text-black">contact@overkill.fr</p>
                <p className="mt-1 text-sm text-gray-600">Pour toute question ou demande d&apos;information.</p>
              </article>
              <article className="rounded-2xl bg-[#ebc09d] p-5 ring-1 ring-black/5">
                <p className="text-sm font-bold text-black">Disponibilité</p>
                <p className="mt-2 text-base font-bold text-black">Du lundi au vendredi</p>
                <p className="mt-1 text-sm text-gray-700">Une réponse vous sera apportée dans les meilleurs délais.</p>
              </article>
            </div>
          </aside>

          <div className="rounded-2xl bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ebc09d] text-xl font-black">?</div>
              <div>
                <h2 className="text-2xl font-black text-black">Envoyer un message</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">Expliquez-nous votre demande, nous reviendrons vers vous rapidement.</p>
              </div>
            </div>

            {isSent ? (
              <div className="mt-7 rounded-xl border border-[#d2915c]/30 bg-[#faf7f4] p-5 text-sm leading-6 text-gray-700" role="status">
                Merci, votre message a bien été préparé. Vous pourrez connecter ici votre service d&apos;envoi.
              </div>
            ) : (
              <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Nom</span>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Votre nom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Adresse email</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="vous@exemple.fr" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Sujet</span>
                  <input name="subject" value={form.subject} onChange={handleChange} required placeholder="L'objet de votre message" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Message</span>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows="6" placeholder="Écrivez votre message ici..." className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#d2915c] focus:ring-4 focus:ring-[#d2915c]/10" />
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d2915c]">
                    Envoyer le message
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Contact
