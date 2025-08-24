import { useState } from 'react'
import './App.css'
import Home from './components/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Feed from './components/Feed/Feed'
import Login from './components/AuthForm/Login'
import Register from './components/AuthForm/Register'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Profile from './components/Profile/Profile'

function App() {

  return (
    <>
    <AuthProvider>
      <Navbar/>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/login" element={
            <ProtectedRoute requireAuth={false} redirectTo="/"> 
            <Login />
            </ProtectedRoute>
          }/>
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false} redirectTo="/">
              <Register />
            </ProtectedRoute>
          }/>
        </Routes>
      </div>
    </AuthProvider>
    </>
  )
}

export default App
