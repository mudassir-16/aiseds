import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import RiskAssessment from './pages/RiskAssessment'
import Navbar from './components/Navbar'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>

  return (
    <Router>
      <div className="min-h-screen bg-gradient-premium text-white font-sans">
        {session && <Navbar />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/analyze" element={session ? <Analyzer /> : <Navigate to="/login" />} />
            <Route path="/risk" element={session ? <RiskAssessment /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
