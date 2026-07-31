import { Link } from 'react-router-dom'
import notFoundImage from '../assets/images/Overkill_404.png'

function NotFound() {
  return (
    <main className="relative grid h-dvh w-full place-items-center overflow-hidden bg-[#0b0908]">
      <h1 className="sr-only">Erreur 404 — Page introuvable</h1>
      <p className="sr-only">
        La page que vous cherchez est introuvable.
      </p>

      <img
        src={notFoundImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute left-1/2 top-[66%] z-10 -translate-x-1/2 -translate-y-1/2">
        <Link
          to="/"
          className="inline-flex min-h-11 whitespace-nowrap items-center justify-center rounded-md border-2 border-[#d8aa87] bg-[#d2915c] px-6 py-3 text-sm font-bold text-black shadow-[0_10px_24px_rgb(0_0_0/0.28)] transition hover:-translate-y-0.5 hover:bg-[#ebc09d] focus:outline-none focus:ring-2 focus:ring-[#ebc09d] focus:ring-offset-2 focus:ring-offset-[#0b0908]"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </main>
  )
}

export default NotFound
