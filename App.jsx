import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import InterviewPrep from './pages/InterviewPrep'
import Chatbot from './pages/Chatbot'
import JobTrends from './pages/JobTrends'
import AnalysisReport from './pages/AnalysisReport'
import RoadmapPage from './pages/Roadmap'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminConsole from './pages/Admin'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-neonCyan"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-neonCyan"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-brand-dark text-slate-100">
    <Navbar />
    <div className="lg:flex">
      <Sidebar />
      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/roadmap" element={<RoadmapPage />} />
                  <Route path="/roadmap/resume/:resumeId/role/:roleId" element={<RoadmapPage />} />
                  <Route path="/prep" element={<InterviewPrep />} />
                  <Route path="/chat" element={<Chatbot />} />
                  <Route path="/trends" element={<JobTrends />} />
                  <Route path="/report/:id" element={<AnalysisReport />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminRoute>{<AdminConsole />}</AdminRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
