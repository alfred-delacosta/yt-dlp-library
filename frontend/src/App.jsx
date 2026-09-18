import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { api, useAuthStore } from './lib/axios'
import { initializeApp } from './lib/initialize'
import AppShell from './components/layout/AppShell'
import MediaSkeleton from './components/library/MediaSkeleton'
import Login from './pages/Login'
import Signup from './pages/Signup'

const Library = lazy(() => import('./pages/Library'))
const Download = lazy(() => import('./pages/Download'))
const Tags = lazy(() => import('./pages/Tags'))
const Account = lazy(() => import('./pages/Account'))
const ViewMedia = lazy(() => import('./pages/ViewMedia'))
const EditVideo = lazy(() => import('./pages/EditVideo'))
const Legacy = lazy(() => import('./pages/Legacy'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RedirectAuthenticatedUser({ children }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  if (isAuthenticated || accessToken) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const { accessToken, getNewAccessToken } = useAuthStore()
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        await getNewAccessToken()
        const token = useAuthStore.getState().accessToken
        if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
      } catch {
        /* not signed in */
      }
      await initializeApp()
      setBooting(false)
    })()
  }, [getNewAccessToken])

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }, [accessToken])

  if (booting) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <MediaSkeleton />
      </div>
    )
  }

  return (
    <Suspense fallback={<MediaSkeleton />}>
      <Routes>
        <Route
          path="/login"
          element={(
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          )}
        />
        <Route
          path="/signup"
          element={(
            <RedirectAuthenticatedUser>
              <Signup />
            </RedirectAuthenticatedUser>
          )}
        />
        <Route
          element={(
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          )}
        >
          <Route path="/" element={<Library />} />
          <Route path="/audio" element={<Library />} />
          <Route path="/download" element={<Download />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/account" element={<Account />} />
          <Route path="/video/:id" element={<ViewMedia type="video" />} />
          <Route path="/mp3/:id" element={<ViewMedia type="mp3" />} />
          <Route path="/edit/video/:id" element={<EditVideo />} />
          <Route path="/legacy" element={<Legacy />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
