import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./utils/ThemeContext";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import NavigationButtons from "./components/NavigationButtons";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./Views/HomePage";
import Signup from "./features/auth/Signup";
import Recovery from "./Views/Recovery";
import Yoga from "./Views/Yoga";
import Acuwellness from "./Views/Acuwellness";
import Spiritual from "./Views/Spiritual";
import EventsPage from "./Views/EventsPage";
import AssistPage from "./Views/AssistPage";
import ProviderSignup from "./features/providers/ProviderSignup";
import ProviderDirectory from "./features/providers/ProviderDirectory";
import ProvidersPage from "./Views/ProvidersPage";
import BenefitsDetail from "./features/providers/BenefitsDetail";
import ExpectationsDetail from "./features/providers/ExpectationsDetail";
import TestimonialsDetail from "./features/providers/TestimonialsDetail";
import AboutPage from "./Views/AboutPage";
import StrategicInitiatives from "./features/providers/StrategicInitiatives";
import LeadershipPage from "./features/providers/LeadershipPage";
import ContactPage from "./features/providers/ContactPage";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProductPage from "./Views/ProductPage";
import ToolsPage from "./Views/ToolsPage";
import BlogPage from "./Views/BlogPage";
import PrivacyPage from "./Views/PrivacyPage";
import TraumaEducationPage from "./Views/TraumaEducationPage";
import CareersPage from "./Views/CareersPage";
import FAQPage from "./Views/FAQPage";
import NewsPage from "./Views/NewsPage";
import NewsBlogsPage from "./Views/NewsBlogsPage";
import ResourceDetail from "./Views/ResourceDetail";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Navbar />
          <NavigationButtons />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route
              path="/providers/directory"
              element={<ProviderDirectory />}
            />
            <Route path="/providers/apply" element={<ProviderSignup />} />
            <Route path="/providers/benefits" element={<BenefitsDetail />} />
            <Route
              path="/providers/expectations"
              element={<ExpectationsDetail />}
            />
            <Route
              path="/providers/testimonials"
              element={<TestimonialsDetail />}
            />
            <Route path="/recovery" element={<Recovery />} />
            <Route path="/yoga" element={<Yoga />} />
            <Route path="/acuwellness" element={<Acuwellness />} />
            <Route path="/spiritual" element={<Spiritual />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/assistance" element={<AssistPage />} />
            <Route path="/assistance/:slug" element={<ResourceDetail />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/trauma-education" element={<TraumaEducationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/about/strategic-initiatives"
              element={<StrategicInitiatives />}
            />
            <Route path="/about/leadership" element={<LeadershipPage />} />
            <Route path="/about/contact" element={<ContactPage />} />
            <Route path="/about/privacy" element={<PrivacyPage />} />
            <Route path="/about/careers" element={<CareersPage />} />
            <Route path="/about/faq" element={<FAQPage />} />
            <Route path="/about/news" element={<NewsPage />} />
            <Route path="/news" element={<NewsBlogsPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
