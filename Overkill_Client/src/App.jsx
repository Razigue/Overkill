import { BrowserRouter, Routes, Route } from "react-router-dom"
import Accueil from './pages/Accueil'
import Profil from "./pages/Profil.jsx";
import Contact from './pages/Contact.jsx'
import Ressources from './pages/Ressources.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ressources" element={<Ressources />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
