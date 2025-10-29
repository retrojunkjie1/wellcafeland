// ...existing code...
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './Views/HomePage';
import Signup from './features/auth/Signup';

// Section pages (create/ensure these files exist)
import Recovery from './Views/Recovery';
import Yoga from './Views/Yoga';
import Acuwellness from './Views/Acuwellness';
import Spiritual from './Views/Spiritual';
import Events from './Views/Events';
import Assistance from './Views/Assistance';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/yoga" element={<Yoga />} />
        <Route path="/acuwellness" element={<Acuwellness />} />
        <Route path="/spiritual" element={<Spiritual />} />
        <Route path="/events" element={<Events />} />
        <Route path="/assistance" element={<Assistance />} />
      </Routes>
    </Router>
  );
}

export default App;
// ...existing code...