import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { ArrowLeft, Calendar, TrendingUp, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { API_URL } from '../config/api'

const JournalHistory = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [moodData, setMoodData] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/journal/me`)
      setEntries(response.data)

      // Prepare mood data for chart
      const moodMap = {
        very_low: 1,
        low: 2,
        neutral: 3,
        good: 4,
        very_good: 5,
      }

      const chartData = response.data
        .filter(e => e.mood)
        .map(e => ({
          date: format(new Date(e.created_at), 'MMM dd'),
          mood: moodMap[e.mood.value] || moodMap[e.mood] || 3,
          entry: e.content.substring(0, 50) + '...',
        }))
        .reverse()

      setMoodData(chartData)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (!deleteConfirm || deleteConfirm !== entryId) {
      setDeleteConfirm(entryId)
      return
    }

    try {
      await axios.delete(`${API_URL}/api/journal/${entryId}`)
      // Remove from local state
      setEntries(entries.filter(e => e.id !== entryId))
      setDeleteConfirm(null)
      // Refresh mood data
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    navigate(`/client/journal/edit/${entry.id}`, { state: { entry } })
  }

  const handleCancelDelete = () => {
    setDeleteConfirm(null)
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/client')}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-primary-700">Journal History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mood Trend Chart */}
        {moodData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Mood Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} tickFormatter={(value) => {
                  const moods = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Very Good']
                  return moods[value] || ''
                }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Journal Entries List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">All Entries</h2>
          </div>

          {entries.length > 0 ? (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.created_at), 'MMMM dd, yyyy')}
                      </span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(entry.created_at), 'h:mm a')}
                      </span>
                      {entry.is_voice && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Voice
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
                          {entry.mood.value || entry.mood}
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Edit entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === entry.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>

                  {entry.ai_analysis && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">AI Insights</h4>
                      <p className="text-sm text-gray-700 mb-2">{entry.ai_analysis.summary}</p>
                      {entry.ai_analysis.keywords && entry.ai_analysis.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entry.ai_analysis.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.ai_analysis.recommendations &&
                        entry.ai_analysis.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">
                              Recommendations:
                            </p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {entry.ai_analysis.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No journal entries yet.</p>
              <button
                onClick={() => navigate('/client/journal/new')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Your First Entry
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default JournalHistory

