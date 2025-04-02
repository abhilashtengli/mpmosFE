import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Body from "./Pages/Body";
import NEHProjectsPage from "./Pages/NehProjects";
import ContactPage from "./Pages/Contact";
import GalleryPage from "./Pages/Gallery";
import AboutPage from "./Pages/About";
import AICRPProjectsPage from "./Pages/AicrpProjects";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            <Route path="/" element={<Home />} />
            <Route path="/nehprojects" element={<NEHProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/aicrp" element={<AICRPProjectsPage />} />
            {/* <Route path="/publications" element={<Publication />} /> */}
            <Route path="/about" element={<AboutPage />} />
            {/* <Route path="/progressreportsubmission" element={<About />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
