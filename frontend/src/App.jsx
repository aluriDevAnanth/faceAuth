import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './pages/components/Header';
import AuthCon from './context/AuthPro';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings'

export default function App() {
  const { auth } = useContext(AuthCon);

  return (
    <div style={{ minHeight: "100vh", height: "100%" }} data-bs-theme='dark' className='bg-dark text-white'>
      {auth && <Header />}
      <Routes>
        <Route path="/" element={auth ? <Home /> : <Login />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
