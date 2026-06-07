import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
// Borrowers page removed per user request
import BorrowerDetails from './pages/BorrowerDetails'
import LoanDetails from './pages/LoanDetails'
import Dashboard from './pages/Dashboard'
import MyDebts from './pages/MyDebts'
import Categories from './pages/Categories'
import Incomes from './pages/Incomes'
import Expenses from './pages/Expenses'
import AllocationProfiles from './pages/AllocationProfiles'
import Goals from './pages/Goals'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{background:'var(--bg)', color:'var(--text)'}}>
        <header className="p-4 border-b" style={{borderColor:'var(--panel)'}}>
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">PayTrail</h1>
            <nav className="flex items-center gap-4">
              <AuthNav />
              <Link to="/my-debts" className="hover:underline">My Debts</Link>
              <Link to="/categories" className="hover:underline">Categories</Link>
              <Link to="/incomes" className="hover:underline">Incomes</Link>
              <Link to="/expenses" className="hover:underline">Expenses</Link>
              <Link to="/goals" className="hover:underline">Goals</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
            <Route path="/my-debts" element={<PrivateRoute><MyDebts/></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><Categories/></PrivateRoute>} />
            <Route path="/incomes" element={<PrivateRoute><Incomes/></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><Expenses/></PrivateRoute>} />
            <Route path="/allocation-profiles" element={<PrivateRoute><AllocationProfiles/></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Goals/></PrivateRoute>} />
            <Route path="/borrower/:id" element={<PrivateRoute><BorrowerDetails/></PrivateRoute>} />
            <Route path="/loan/:id" element={<PrivateRoute><LoanDetails/></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        </div>
      </BrowserRouter>
      </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function PrivateRoute({ children }){
  const { user, loading } = useAuth()
  if(loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function RequireAuthRedirect({ children }){
  const { user, loading } = useAuth()
  if(loading) return <div>Loading...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AuthNav(){
  const { user, logout } = useAuth()
  if(user){
    return (<>
      <Link to="/dashboard" className="mr-4 hover:underline">Dashboard</Link>
      <button onClick={logout} className="px-2 py-1" style={{background:'transparent',color:'var(--text)'}}>Sign out</button>
    </>)
  }
  return (<Link to="/login" className="hover:underline">Login</Link>)
}