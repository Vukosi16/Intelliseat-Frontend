import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
import {
  initialAssessments,
  initialIssues,
  initialSessions,
  initialStudents,
  navigation,
} from './data/demoData.js'
import Alerts from './pages/Alerts.jsx'
import Assessments from './pages/Assessments.jsx'
import CreateUsers from './pages/CreateUsers.jsx'
import Eligibility from './pages/Eligibility.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Login from './pages/Login.jsx'
import Overview from './pages/Overview.jsx'
import Reports from './pages/Reports.jsx'
import Support from './pages/Support.jsx'

function App() {
  // The app shell owns shared records so updates stay consistent between pages.
  const [screen, setScreen] = useState('login')
  const [page, setPage] = useState('overview')
  const [admin, setAdmin] = useState('admin@intelliseat.co.za')
  const [users, setUsers] = useState(initialStudents)
  const [issues, setIssues] = useState(initialIssues)
  const [assessments, setAssessments] = useState(initialAssessments)
  const [sessions] = useState(initialSessions)
  const [alerts, setAlerts] = useState([])

  // Keep page changes in one place so sidebar and dashboard actions behave alike.
  function navigate(nextPage) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateEligibility(studentNumber, eligible) {
    setUsers((currentUsers) => currentUsers.map((user) => (
      user.number === studentNumber
        ? {
            ...user,
            eligible,
            clearance: eligible ? 'Cleared' : 'Outstanding fees',
          }
        : user
    )))
  }

  function resolveIssue(student, time) {
    setIssues((currentIssues) => currentIssues.map((issue) => (
      issue.student === student && issue.time === time
        ? { ...issue, status: 'Resolved' }
        : issue
    )))
  }

  function addUser(user) {
    setUsers((currentUsers) => [user, ...currentUsers])
  }

  function addAssessment(assessment) {
    setAssessments((currentAssessments) => [assessment, ...currentAssessments])
  }

  function addAlert(alert) {
    setAlerts((currentAlerts) => [alert, ...currentAlerts])
  }

  function logIn(email) {
    setAdmin(email)
    setScreen('dashboard')
  }

  function logOut() {
    setScreen('login')
    setPage('overview')
  }

  // Each page receives only the data and actions it needs.
  function renderPage() {
    switch (page) {
      case 'users':
        return <CreateUsers onCreate={addUser} />
      case 'eligibility':
        return (
          <Eligibility
            students={users.filter((user) => user.role !== 'Invigilator')}
            onUpdate={updateEligibility}
          />
        )
      case 'assessments':
        return <Assessments assessments={assessments} onCreate={addAssessment} />
      case 'reports':
        return <Reports sessions={sessions} />
      case 'support':
        return <Support issues={issues} onResolve={resolveIssue} />
      case 'alerts':
        return <Alerts alerts={alerts} onCreate={addAlert} />
      default:
        return (
          <Overview
            users={users}
            assessments={assessments}
            issues={issues}
            sessions={sessions}
            onNavigate={navigate}
          />
        )
    }
  }

  const pageTitle = navigation.find((item) => item.id === page)?.label ?? 'Dashboard'

  if (screen === 'login') {
    return (
      <Login
        onLogin={logIn}
        onForgot={() => setScreen('forgot')}
      />
    )
  }

  if (screen === 'forgot') {
    return <ForgotPassword onBack={() => setScreen('login')} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={page}
        onNavigate={navigate}
        onLogout={logOut}
        admin={admin}
      />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Admin Portal</span>
            <span aria-hidden="true">/</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">Tuesday, 15 September 2026</span>
            <button
              type="button"
              className="notification-button"
              aria-label={`Notifications${alerts.length ? `, ${alerts.length} new` : ''}`}
              onClick={() => navigate('alerts')}
            >
              ♧{alerts.length > 0 && <i>{alerts.length}</i>}
            </button>
            <span className="top-avatar">{admin.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <div className="page-content">
          {renderPage()}
          <footer className="page-footer">
            © 2026 IntelliSeat · Richfield College
            <span>Secure assessment administration</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
