import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ChatPage from './pages/ChatPage';

const AppLayout = () => {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat');

  return (
    <div className={isChatRoute ? '' : 'page-wrapper'}>
      {!isChatRoute && <Navbar />}
      <main className={isChatRoute ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Routes>
      </main>
      {!isChatRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
