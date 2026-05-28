import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import MovieDetailPage from './pages/MovieDetailPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import AdminDashboard from './pages/AdminDashboard';
import { WatchlistPage, HistoryPage, ProfilePage } from './pages/UserPages';
import './styles/globals.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppLayout({ children, hideFooter = false }) {
  return (
    <>
      <Navbar />
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
      <Route path="/browse" element={<AppLayout><BrowsePage /></AppLayout>} />
      <Route path="/movie/:id" element={<AppLayout><MovieDetailPage /></AppLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/watchlist" element={<ProtectedRoute><AppLayout><WatchlistPage /></AppLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout hideFooter><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={
        <AppLayout>
          <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
            <h1 style={{fontFamily:'Bebas Neue',fontSize:80,color:'var(--accent)'}}>404</h1>
            <p style={{color:'var(--text2)'}}>Page not found</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        </AppLayout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
