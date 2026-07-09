import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Camera, Loader2, CheckCircle } from 'lucide-react'

const Profile = () => {
  const { user, updateProfile, refreshProfile } = useAuth()
  const [profileData, setProfileData] = useState({ full_name: '', phone: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [status, setStatus] = useState({ message: '', type: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        bio: user.profile.bio || ''
      })
    }
  }, [user])

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ message: '', type: '' })

    try {
      await updateProfile(profileData)
      setStatus({ message: 'Profile saved successfully.', type: 'success' })
    } catch (error) {
      setStatus({ message: error.response?.data?.detail || 'Could not update your profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setStatus({ message: 'Please choose an image to upload.', type: 'error' })
      return
    }

    setUploading(true)
    setStatus({ message: '', type: '' })

    try {
      const formData = new FormData()
      formData.append('file', avatarFile)
      await api.post('/api/resume/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await refreshProfile()
      setStatus({ message: 'Profile picture uploaded successfully.', type: 'success' })
    } catch (error) {
      setStatus({ message: error.response?.data?.detail || 'Upload failed.', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = user?.profile?.profile_picture_url
    ? user.profile.profile_picture_url.startsWith('http')
      ? user.profile.profile_picture_url
      : `/${user.profile.profile_picture_url}`
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-neonCyan font-semibold">Profile</p>
          <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
          <p className="text-sm text-slate-400 mt-2">Manage your CloudHire AI profile and upload your image for a polished dashboard experience.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="glass-panel rounded-3xl border border-slate-800 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-28 w-28 rounded-full object-cover border border-brand-neonCyan/25 shadow-sm" />
              ) : (
                <div className="h-28 w-28 rounded-full bg-brand-indigo/30 border border-brand-neonCyan/20 grid place-items-center text-3xl font-bold text-brand-neonCyan">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="space-y-1 text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Account</p>
              <p className="text-base font-semibold text-white">{user?.email}</p>
            </div>
            <div className="space-y-3 w-full">
              <label className="block text-sm font-semibold text-slate-300">Upload a profile image</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-slate-800 bg-brand-navy/50 text-sm text-slate-200 file:mr-4 file:p-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-neonCyan/10 file:text-brand-neonCyan"
              />
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-neonCyan px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-neonCyan/90 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Upload Image
              </button>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl border border-slate-800 p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                Full Name
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                />
              </label>

              <label className="block text-sm text-slate-400">
                Phone
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-400">
              Bio
              <textarea
                value={profileData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
              />
            </label>

            {status.message && (
              <div className={`rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-indigo px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save Profile
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Profile
