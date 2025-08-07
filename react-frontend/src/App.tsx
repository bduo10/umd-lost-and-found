import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './components/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Feed from './components/Feed/Feed'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
    <Navbar/>
    <div className="container">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </div>
    </>
  )
}

export default App
