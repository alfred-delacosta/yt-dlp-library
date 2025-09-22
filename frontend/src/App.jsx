import { Routes, Route, Navigate } from 'react-router'
import { useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Logout from './components/Logout'
import ViewVideo from './pages/ViewVideo'
import Navbar from './components/Navbar'
import Legacy from './pages/Legacy'
import { useAuthStore } from './lib/axios'
import ViewMp3 from './pages/ViewMp3'
import EditVideo from './pages/EditVideo'
import * as bootstrap from 'bootstrap'
import { initializeThemeToggler } from './lib/boostrap.themeSwitcher'


// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, accessToken } = useAuthStore();

	if (!isAuthenticated && !accessToken) {
		return <Navigate to='/login' replace />;
	}

	// if (!user.isVerified) {
	// 	return <Navigate to='/verify-email' replace />;
	// }

	return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    initializeThemeToggler();
  }, [])

  return (
    <div className='h-100'>
      {/* {accessToken ? <p>{accessToken}</p> : <p>No access token found</p>} */}
      <Navbar isAuthenticated={isAuthenticated} accessToken={accessToken} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/legacy" element={<Legacy />} />
        <Route path="/login" element={
          <RedirectAuthenticatedUser>
            <Login />
          </RedirectAuthenticatedUser>
          }/>
        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <Signup />
          </RedirectAuthenticatedUser>
        }/>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }/>
        <Route path="/video/:id" element={
          <ProtectedRoute>
            <ViewVideo />
          </ProtectedRoute>
        } />
        <Route path="/mp3/:id" element={
          <ProtectedRoute>
            <ViewMp3 />
          </ProtectedRoute>
        } />
        <Route path="/edit/video/:id" element={
          <ProtectedRoute>
            <EditVideo />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
