import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { LogOut, Users, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TherapistDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientJournals, setClientJournals] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchClients()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/therapist/dashboard`)
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/therapist/clients`)
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchClientJournals = async (clientId) => {
    try {
      const response = await axios.get(`${API_URL}/api/therapist/clients/${clientId}/journals`)
      setClientJournals(response.data)
      setSelectedClient(clientId)
    } catch (error) {
      console.error('Error fetching client journals:', error)
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

  // Prepare mood trends data for chart
  const moodChartData = dashboardData
    ? Object.entries(dashboardData.mood_trends).map(([mood, count]) => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1).replace('_', ' '),
        count,
      }))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">Therapist Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.total_clients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.active_clients}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.engagement_rate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recent Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.recent_entries?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood Trends Chart */}
        {moodChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Mood Trends (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mood" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Clients List and Journal Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clients List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Clients
            </h2>
            <div className="space-y-3">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => fetchClientJournals(client.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedClient === client.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        {client.engagement_score}% engaged
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{client.entry_count} entries</span>
                      {client.last_entry_date && (
                        <span>
                          Last: {format(new Date(client.last_entry_date), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No clients yet</p>
              )}
            </div>
          </div>

          {/* Journal Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Journal Feed</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedClient && clientJournals.length > 0 ? (
                clientJournals.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.created_at), 'MMM dd, yyyy h:mm a')}
                      </span>
                      {entry.mood && (
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded capitalize">
                          {entry.mood.value || entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-3">{entry.content}</p>
                    {entry.ai_analysis && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p className="text-gray-600 font-semibold">AI Summary:</p>
                        <p className="text-gray-700">{entry.ai_analysis.summary}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : dashboardData?.recent_entries && dashboardData.recent_entries.length > 0 ? (
                dashboardData.recent_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.created_at), 'MMM dd, yyyy h:mm a')}
                      </span>
                      {entry.mood && (
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded capitalize">
                          {entry.mood.value || entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-3">{entry.content}</p>
                    {entry.ai_analysis && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p className="text-gray-600 font-semibold">AI Summary:</p>
                        <p className="text-gray-700">{entry.ai_analysis.summary}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {selectedClient
                    ? 'No journal entries for this client'
                    : 'Select a client to view their journals'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TherapistDashboard

