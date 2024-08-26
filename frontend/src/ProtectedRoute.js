// src/ProtectedRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const ProtectedRoute = ({ element: Element, ...rest }) => {
    const { user } = useAuth();

    return (
        <Route
            {...rest}
            element={user ? <Element /> : <Navigate to="/" replace />}
        />
    );
};

export default ProtectedRoute;
