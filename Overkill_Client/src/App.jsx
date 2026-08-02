import { BrowserRouter, Routes, Route } from "react-router-dom"
import Accueil from './pages/Accueil'
import Profil from "./pages/Profil.jsx";
import Contact from './pages/Contact.jsx'
import Ressources from './pages/Ressources.jsx'
import GuideOffres from './pages/GuideOffres.jsx'
import GuideCv from './pages/GuideCv.jsx'
import AnalyseAts from './pages/AnalyseAts.jsx'
import Feed from './pages/Feed.jsx'
import Legal from './pages/Legal.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ressources" element={<Ressources />} />
        <Route path="/ressources/offres" element={<GuideOffres />} />
        <Route path="/ressources/cv" element={<GuideCv />} />
        <Route path="/ressources/analyse-ats" element={<AnalyseAts />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App