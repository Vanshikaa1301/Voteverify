import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Landing from '../pages/Landing'
import Dashboard from '../pages/Dashboard'
import BoothMap from '../pages/BoothMap'
import Alerts from '../pages/Alerts'
import Proofs from '../pages/Proofs'
import Statistics from '../pages/Statistics'
import CastVote from '../pages/CastVote'
import SignIn from '../pages/SignIn'
import SignUp from '../pages/SignUp'
import About from '../pages/About'
import Team from '../pages/Team'
import RegisterVoter from '../pages/RegisterVoter'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-vv-bg text-vv-text">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vv-accent"></div>
      </div>
    )
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/team" element={<Team />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/map" element={<BoothMap />} />
          <Route path="/dashboard/alerts" element={<Alerts />} />
          <Route path="/dashboard/proofs" element={<Proofs />} />
          <Route path="/dashboard/statistics" element={<Statistics />} />
          <Route path="/dashboard/register" element={<RegisterVoter />} />
          <Route path="/dashboard/verify" element={<CastVote />} />
        </Route>
      </Route>
    </Routes>
  )
}
