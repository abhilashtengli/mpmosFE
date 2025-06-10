import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Body from "./Pages/Body";
import NEHProjectsPage from "./Pages/NehProjects";
import ContactPage from "./Pages/Contact";
import GalleryPage from "./Pages/Gallery";
import AboutPage from "./Pages/About";
import AICRPProjectsPage from "./Pages/AicrpProjects";
import AdminBody from "./Pages/admin/AdminBody";
import ReportsAdPage from "./Pages/admin/reports";
import GalleryAdPage from "./Pages/admin/Content/gallery";
import ProjectsAdPage from "./Pages/admin/ProjectActivities/projects";
import PublicationsAdPage from "./Pages/admin/Content/publications";
import EventsAdPage from "./Pages/admin/Content/upcoming_events";
import AwarenessAdPage from "./Pages/admin/ProjectActivities/awarness";
import FLDAdPage from "./Pages/admin/ProjectActivities/fld";
import InfrastructureAdPage from "./Pages/admin/ProjectActivities/infrastructure_dev";
import InputDistributionAdPage from "./Pages/admin/ProjectActivities/input_distribution";
import TrainingAdPage from "./Pages/admin/ProjectActivities/trainings";
import DashboardAdPage from "./Pages/admin/dashboard";
import SigninPage from "./Pages/admin/auth/signin";
import ProtectedRoute from "./Pages/admin/auth/protectRoute";
import { useSSEConnection } from "./hooks/useSSEConnection";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";

function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useSSEConnection();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, []);

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
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminBody />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardAdPage />} />
            <Route path="reports" element={<ReportsAdPage />} />
            <Route path="gallery" element={<GalleryAdPage />} />
            <Route path="project_details" element={<ProjectsAdPage />} />
            <Route path="publications" element={<PublicationsAdPage />} />
            <Route path="upcoming_events" element={<EventsAdPage />} />
            <Route path="awarness_programs" element={<AwarenessAdPage />} />
            <Route path="fld" element={<FLDAdPage />} />
            <Route
              path="infrastructure_development"
              element={<InfrastructureAdPage />}
            />
            <Route
              path="input_distribution"
              element={<InputDistributionAdPage />}
            />
            <Route path="projects" element={<ProjectsAdPage />} />
            <Route path="trainings" element={<TrainingAdPage />} />
          </Route>

          <Route path="/admin">
            <Route path="signin" element={<SigninPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
