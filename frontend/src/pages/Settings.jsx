import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { ArrowLeft, User, Bell, Shield, LogOut } from 'lucide-react'
import { API_URL } from '../config/api'

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
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
            <h1 className="text-2xl font-bold text-primary-700">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Profile Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.full_name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Daily Reminders</p>
                <p className="text-sm text-gray-600">Receive reminders to journal</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your data is encrypted and stored securely. We comply with HIPAA and GDPR
                regulations to protect your privacy.
              </p>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Download my data
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings

