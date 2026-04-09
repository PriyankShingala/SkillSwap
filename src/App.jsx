import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import UserProfile from './pages/UserProfile';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth type="login" />} />
            <Route path="/signup" element={<Auth type="signup" />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/requests" element={<Requests />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
