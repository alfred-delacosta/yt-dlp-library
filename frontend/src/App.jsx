import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router'
import Login from './pages/Login'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Logout from './components/Logout'
import { useAuthStore } from './lib/axios'


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
  const { accessToken } = useAuthStore();

  return (
    <div className='h-screen'>
      {accessToken ? <p>{accessToken}</p> : <p>No access token found</p>}
      <Logout />
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </div>
  )
}

export default App
