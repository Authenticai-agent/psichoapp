import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ClientDashboard from './pages/ClientDashboard'
import TherapistDashboard from './pages/TherapistDashboard'
import JournalEntry from './pages/JournalEntry'
import JournalHistory from './pages/JournalHistory'
import Settings from './pages/Settings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/client"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/journal/new"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <JournalEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/journal/edit/:entryId"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <JournalEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/journal/history"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <JournalHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/settings"
              element={
                <PrivateRoute allowedRoles={['client']}>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/therapist"
              element={
                <PrivateRoute allowedRoles={['therapist', 'admin']}>
                  <TherapistDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

