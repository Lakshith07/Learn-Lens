import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import About from './components/About';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

// Main Landing Page Component
const LandingPage = () => (
  <div className="min-h-screen flex flex-col font-sans selection:bg-ll-pale-blue selection:text-ll-dark bg-slate-50">
    <Navbar />
    <main className="flex-grow pt-24 pb-12">
      <Hero />
      <HowItWorks />
      <About />
      <FAQ />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
