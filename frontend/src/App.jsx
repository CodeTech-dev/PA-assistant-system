import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './main.css';

import Dashboard from './pages/dashboard';
import Appointments from './pages/appointments';
import Calendar from './pages/calendar';
import Tasks from './pages/tasks';
import Layout from './components/layout'

import Register from './users/Register';
import Login from './users/Login'
import Profile from './pages/profile';


const App = () => {
    return(
        <Router>
            <div className='app'>
                <Routes>
                    <Route path='/' element={ <Navigate to="/register" /> }></Route>
                    <Route path='/register' element={ <Register /> }></Route>
                    <Route path='/login' element={ <Login /> }></Route>

                    {/* Routes with sidebar */}
                    <Route path='/dashboard' element={
                        <Layout><Dashboard /></Layout> }>
                    </Route>
                    <Route path='/calendar' element={
                        <Layout><Calendar /></Layout> }>    
                    </Route>
                    <Route path='/appointments' element={
                        <Layout><Appointments /> </Layout>}>
                    </Route>
                    <Route path='/tasks' element={
                        <Layout><Tasks /></Layout>}>   
                    </Route>
                    <Route path='/profile' element={
                        <Layout><Profile /></Layout>}>   
                    </Route>        
                </Routes>
            </div>
        </Router>
    )
}

export default App;
