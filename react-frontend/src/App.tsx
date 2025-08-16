import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './components/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Feed from './components/Feed/Feed'
import Login from './components/AuthForm/Login'
import Register from './components/AuthForm/Register'
import { Routes, Route } from 'react-router-dom'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <>
    <Navbar
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
    />
    <div className="container">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
    </>
  )
}

export default App
