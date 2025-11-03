import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { ArrowLeft, Mic, Save } from 'lucide-react'
import { API_URL } from '../config/api'

const JournalEntry = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [isVoice, setIsVoice] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recording is not supported in your browser')
      return
    }

    setIsRecording(true)
    setIsVoice(true)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Store recognition instance to stop it later
    window.currentRecognition = recognition

    recognition.continuous = true
    recognition.interimResults = true

    // Track the last final result index to avoid duplicates
    let lastFinalIndex = -1

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          // Only add final results that we haven't processed yet
          if (i > lastFinalIndex) {
            finalTranscript += transcript + ' '
            lastFinalIndex = i
          }
        } else {
          // Interim results for live feedback
          interimTranscript += transcript
        }
      }
      
      // Update content: add final results, show interim results temporarily
      if (finalTranscript) {
        setContent(prev => {
          // Remove any interim text that's now final, then add the final text
          const cleaned = prev.trim()
          return cleaned + (cleaned ? ' ' : '') + finalTranscript.trim()
        })
      }
      
      // Show interim results in real-time (optional - you can remove this if you don't want it)
      // For now, we'll just show final results to avoid duplication
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      setError('Voice recording error. Please try again.')
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const stopVoiceRecording = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop()
      window.currentRecognition = null
    }
    setIsRecording(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await axios.post(`${API_URL}/api/journal`, {
        content,
        mood: mood || null,
        is_voice: isVoice,
      })

      if (response.data) {
        navigate('/client')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save journal entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/client')}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-primary-700">New Journal Entry</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? (Optional)
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select mood...</option>
              <option value="very_low">Very Low</option>
              <option value="low">Low</option>
              <option value="neutral">Neutral</option>
              <option value="good">Good</option>
              <option value="very_good">Very Good</option>
            </select>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Journal Entry
              </label>
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                  isRecording
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                {isRecording ? 'Stop Recording' : 'Voice Input'}
              </button>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
            />
            <p className="text-sm text-gray-500 mt-2">
              {content.length} characters
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/client')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Tip: Your entry will be analyzed for mood insights. You can also use voice input for hands-free journaling.</p>
        </div>
      </main>
    </div>
  )
}

export default JournalEntry

