import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { ShieldAlert, Plus, Users, ClipboardList, Sparkles, Link2 } from 'lucide-react'

const AdminConsole = () => {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [skills, setSkills] = useState([])
  const [certifications, setCertifications] = useState([])
  const [newSkill, setNewSkill] = useState({ name: '', category: '' })
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', difficulty: 'Beginner', cloud_provider: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsRes, usersRes, rolesRes, skillsRes, certRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users'),
          api.get('/api/admin/job-roles'),
          api.get('/api/admin/skills'),
          api.get('/api/admin/certifications')
        ])

        setStats(statsRes.data)
        setUsers(usersRes.data)
        setRoles(rolesRes.data)
        setSkills(skillsRes.data)
        setCertifications(certRes.data)
      } catch (err) {
        console.error('Could not load admin dashboard', err)
      }
    }

    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const handleAddSkill = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await api.post('/api/admin/skills', newSkill)
      setSkills((prev) => [...prev, newSkill])
      setNewSkill({ name: '', category: '' })
      setMessage('Skill added successfully.')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to add skill.')
    }
  }

  const handleAddCertification = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await api.post('/api/admin/certifications', newCertification)
      setCertifications((prev) => [...prev, newCertification])
      setNewCertification({ name: '', issuer: '', difficulty: 'Beginner', cloud_provider: '' })
      setMessage('Certification added successfully.')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to add certification.')
    }
  }

  if (!isAdmin) {
    return (
      <div className="glass-panel rounded-3xl border border-slate-800 p-10 text-center">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-brand-neonCyan" />
        <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-sm text-slate-400 mt-3">Only admin users can access the management console.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-neonCyan font-semibold">Admin Console</p>
          <h1 className="text-3xl font-extrabold text-white">CloudHire AI Operations</h1>
          <p className="mt-2 text-sm text-slate-400">Review user analytics, manage skills and certifications, and inspect role-based demand.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <div className="glass-panel rounded-3xl border border-slate-800 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Users</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{stats?.total_users ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-400">Registered accounts on the platform.</p>
        </div>
        <div className="glass-panel rounded-3xl border border-slate-800 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Resumes</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{stats?.total_resumes ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-400">Resumes uploaded for skill analysis.</p>
        </div>
        <div className="glass-panel rounded-3xl border border-slate-800 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Reports</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{stats?.total_reports ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-400">Skill gap analyses created by candidates.</p>
        </div>
        <div className="glass-panel rounded-3xl border border-slate-800 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Average Match</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{stats?.average_match_score ?? '--'}%</p>
          <p className="mt-2 text-sm text-slate-400">Average role match percentage.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-3xl border border-brand-neonCyan/20 bg-brand-neonCyan/5 p-4 text-sm text-brand-neonCyan">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-brand-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Current Job Roles</h2>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {roles.map(role => (
              <div key={role.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="font-semibold text-slate-100">{role.title}</p>
                <p className="text-xs text-slate-500">Level: {role.difficulty}</p>
                <p className="mt-2 text-sm text-slate-400">Skills: {role.required_skills.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Top Certifications</h2>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {certifications.map((cert, index) => (
              <div key={`${cert.name}-${index}`} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="font-semibold text-slate-100">{cert.name}</p>
                <p className="text-xs text-slate-500">Issuer: {cert.issuer} • Level: {cert.difficulty}</p>
                <p className="mt-2 text-sm text-slate-400">Cloud: {cert.cloud_provider || 'General'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-brand-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Registered Users</h2>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {users.map(userEntry => (
              <div key={userEntry.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-100">{userEntry.email}</p>
                  <p className="text-xs text-slate-500">Admin: {userEntry.is_admin ? 'Yes' : 'No'}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-400">{userEntry.is_active ? 'Active' : 'Disabled'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="h-5 w-5 text-brand-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Manage Skills & Certifications</h2>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Skill name</label>
              <input
                value={newSkill.name}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                placeholder="Terraform"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Category</label>
              <input
                value={newSkill.category}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                placeholder="DevOps"
              />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-brand-neonCyan px-4 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-neonCyan/90">
              <Plus className="h-4 w-4" /> Add Skill
            </button>
          </form>

          <form onSubmit={handleAddCertification} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400">Certification title</label>
              <input
                value={newCertification.name}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                placeholder="AWS Cloud Practitioner"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={newCertification.issuer}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, issuer: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                placeholder="AWS"
              />
              <input
                value={newCertification.cloud_provider}
                onChange={(e) => setNewCertification((prev) => ({ ...prev, cloud_provider: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
                placeholder="AWS / Azure / GCP"
              />
            </div>
            <select
              value={newCertification.difficulty}
              onChange={(e) => setNewCertification((prev) => ({ ...prev, difficulty: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-brand-navy/60 p-3 text-sm text-white outline-none focus:border-brand-neonCyan"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-brand-indigo px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo/90">
              <Plus className="h-4 w-4" /> Add Certification
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default AdminConsole
