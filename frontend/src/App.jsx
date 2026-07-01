import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Villagers from './pages/Villagers';
import Surveys from './pages/Surveys';
import Complaints from './pages/Complaints';
import Analysis from './pages/Analysis';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="villagers" element={<Villagers />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
