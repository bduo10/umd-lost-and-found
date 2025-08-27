import './App.css'
import Home from './components/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Feed from './components/Feed/Feed'
import Login from './components/AuthForm/Login'
import Register from './components/AuthForm/Register'
import Chat from './components/Chat/Chat'
import { Routes, Route, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Profile from './components/Profile/Profile'

// Wrapper component to handle current user profile route
function CurrentUserProfile() {
  const { user } = useAuth();
  if (!user) {
    return <div>Please log in to view your profile</div>;
  }
  return <Profile username={user.username} />;
}

// Wrapper component to handle dynamic username route
function ProfileWrapper() {
  const { username } = useParams<{ username: string }>();
  if (!username) {
    return <div>Invalid profile URL</div>;
  }
  return <Profile username={username} />;
}

function App() {

  return (
    <>
    <AuthProvider>
      <Navbar/>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={
            <ProtectedRoute requireAuth={true} redirectTo="/login">
              <CurrentUserProfile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<ProfileWrapper />} />
          <Route path="/chat" element={
            <ProtectedRoute requireAuth={true} redirectTo="/login">
              <Chat />
            </ProtectedRoute>
          } />

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
