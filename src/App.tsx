import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Body from "./Pages/Body";
import NEHProjectsPage from "./Pages/NehProjects";
import ContactPage from "./Pages/Contact";
import GalleryPage from "./Pages/Gallery";
import AboutPage from "./Pages/About";
import AICRPProjectsPage from "./Pages/AicrpProjects";
import AdminBody from "./Pages/admin/AdminBody";

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

          {/* Admin Pages  */}
          <Route path="/admin" element={<AdminBody />}>
            <Route path="dashboard" element={<AdminBody />} />
            <Route path="reports" element={<AdminBody />} />
            <Route path="gallery" element={<AdminBody />} />
            <Route path="project_details" element={<AdminBody />} />
            <Route path="publications" element={<AdminBody />} />
            <Route path="upcoming_events" element={<AdminBody />} />
            <Route path="awarness_programs" element={<AdminBody />} />
            <Route path="fld" element={<AdminBody />} />
            <Route path="infrastructure_development" element={<AdminBody />} />
            <Route path="input_distribution" element={<AdminBody />} />
            <Route path="projects" element={<AdminBody />} />
            <Route path="trainings" element={<AdminBody />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
