import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './main.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/dashboard';
import Tasks from './pages/tasks';
import Layout from './components/layout'

import Register from './users/Register';
import Login from './users/Login'
import Profile from './pages/nottifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import ContactsContainer from './pages/contacts';
import AppointmentPage from './pages/appointment';
import CheckEmail from './users/CheckMail';
import ActivateAccount from './users/ActivateAccount';
import ForgotPassword from './users/ForgotPasword';
import ResetPasswordConfirm from './users/ResetPasswordConfirm';


const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    // If not loading and no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the child component (e.g., <Layout><Dashboard /></Layout>)
  return children;
};

const App = () => {
    return(
        <AuthProvider>
        <Router>
            <div className='app'>
                <Routes>
                    {/* --- 2. THESE ARE YOUR PUBLIC ROUTES --- */}
                    <Route path='/register' element={ <Register /> }></Route>
                    <Route path='/login' element={ <Login /> }></Route>
                    <Route path="/check-email" element={<CheckEmail />} />
                    <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/password-reset-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />

                    {/* --- 3. WRAP YOUR LAYOUT ROUTES IN ProtectedRoute --- */}
                    <Route path='/dashboard' element={
                        <ProtectedRoute>
                            <Layout><Dashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    {/* <Route path='/calendar' element={
                        <ProtectedRoute>
                            <Layout><Calendar /></Layout>
                        </ProtectedRoute>
                    } /> */}
                    <Route path='/appointment' element={
                        <ProtectedRoute>
                            <Layout><AppointmentPage /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path='/contacts' element={
                        <ProtectedRoute>
                            <Layout><ContactsContainer /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path='/tasks' element={
                        <ProtectedRoute>
                            <Layout><Tasks /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path='/notifications' element={
                        <ProtectedRoute>
                            <Layout><Profile /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path='/' element={ <Navigate to="/dashboard" /> }></Route>
                    
                </Routes>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    />
            </div>
        </Router>
        </AuthProvider>
    )
}

export default App;