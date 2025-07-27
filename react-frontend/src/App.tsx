import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import { Routes } from 'react-router-dom'

function App() {

  return (
    <>
    <Navbar/>
    <div className="container">
      <Routes>
      </Routes>
    </div>
    </>
  )
}

export default App
