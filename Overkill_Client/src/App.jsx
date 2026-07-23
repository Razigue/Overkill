import { BrowserRouter, Routes, Route } from "react-router-dom"
import Accueil from './pages/Accueil'
import Profil from "./pages/Profil.jsx";
import Contact from './pages/Contact.jsx'
import Ressources from './pages/Ressources.jsx'
import GuideOffres from './pages/GuideOffres.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ressources" element={<Ressources />} />
        <Route path="/ressources/offres" element={<GuideOffres />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
