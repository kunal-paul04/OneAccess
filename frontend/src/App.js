import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './authContext'; // Import AuthProvider and useAuth
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register';
import Profile from './Profile';
import Services from './Services';
import AddService from './AddService';
import ViewService from './ViewService';
import ClientRegister from './ClientRegister';
import ClientLogin from './ClientLogin';
import { getUserSession } from './utils/authUtils';

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const userSession = getUserSession();
  return userSession ? <Element {...rest} /> : <Navigate to="/" replace />;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
            <Route path="/services" element={<ProtectedRoute element={Services} />} />
            <Route path="/addservice" element={<ProtectedRoute element={AddService} />} />
            <Route path="/viewservice" element={<ProtectedRoute element={ViewService} />} />
            <Route path="/cr_gsi" element={<ClientRegister />} />
            <Route path="/cl_gsi" element={<ClientLogin />} />
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
