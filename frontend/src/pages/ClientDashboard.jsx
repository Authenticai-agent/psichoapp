import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Calendar, BookOpen, Heart, LogOut, Settings, Activity } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ClientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [affirmation, setAffirmation] = useState('')
  const [activities, setActivities] = useState([])
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch daily affirmation
      const affResponse = await axios.post(`${API_URL}/api/ai/affirmation`, {
        user_id: user.id,
      })
      setAffirmation(affResponse.data.affirmation)

      // Fetch activity suggestions
      const actResponse = await axios.get(`${API_URL}/api/ai/activities`)
      setActivities(actResponse.data)

      // Fetch recent journal entries
      const entriesResponse = await axios.get(`${API_URL}/api/journal/me?limit=3`)
      setRecentEntries(entriesResponse.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">AuthenticAI</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/client/settings"
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Affirmation */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-2">Today's Affirmation</h2>
          <p className="text-lg">{affirmation || 'You are doing your best, and that is enough.'}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/client/journal/new"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">New Journal Entry</h3>
                <p className="text-sm text-gray-600">Record your thoughts today</p>
              </div>
            </div>
          </Link>

          <Link
            to="/client/journal/history"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Journal History</h3>
                <p className="text-sm text-gray-600">View past entries</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mood Tracker</h3>
                <p className="text-sm text-gray-600">Track your emotions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activities */}
        {activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Suggested Activities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{activity.duration_minutes} min</span>
                    <span>•</span>
                    <span className="capitalize">{activity.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Journal Entries</h2>
          {recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/client/journal/history`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    {entry.mood && (
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 line-clamp-2">
                    {entry.content.substring(0, 150)}...
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No journal entries yet. Start your first entry!
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard

