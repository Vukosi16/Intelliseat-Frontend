import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
import {
  initialAssessments,
  initialIssues,
  initialStudents,
  navigation,
} from './data/demoData.js'
import { clearAuth, getStoredUser, request, setAuth } from './api.js'
import { formatDate } from './date.js'

const todayLabel = formatDate(new Date())
import Alerts from './pages/Alerts.jsx'
import Assessments from './pages/Assessments.jsx'
import CreateUsers from './pages/CreateUsers.jsx'
import ManageUsers from './pages/ManageUsers.jsx'
import Eligibility from './pages/Eligibility.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Login from './pages/Login.jsx'
import Overview from './pages/Overview.jsx'
import Reports from './pages/Reports.jsx'
import Support from './pages/Support.jsx'
import Venues from './pages/Venues.jsx'
import qualificationCatalog from './qualificationCatalog.js'

const hasApi = Boolean(import.meta.env.VITE_API_URL)

function normalizeAssessment(assessment) {
  const startsAt = assessment.startsAt || assessment.date
  const endDate = assessment.endsAt || assessment.date
  const start = startsAt ? new Date(startsAt) : null
  const end = endDate ? new Date(endDate) : null

  return {
    ...assessment,
    moduleCode: assessment.module?.code || assessment.moduleId?.code || assessment.moduleCode || assessment.moduleName || '',
    date: start ? start.toISOString().slice(0, 10) : assessment.date,
    startTime: start ? start.toTimeString().slice(0, 5) : assessment.startTime,
    endTime: end ? end.toTimeString().slice(0, 5) : assessment.endTime,
    venue: assessment.venue || assessment.venueId || { _id: '', name: 'Unassigned' },
    invigilatorId: assessment.invigilatorId || assessment.invigilatorIds?.[0]?._id || null,
  }

}

function normalizeIssue(issue) {
  return {
    ...issue,
    reporter: issue.reporter || {
      _id: issue.reporterId?._id,
      role: issue.reporterId?.role || 'user',
      name: issue.reporterId?.fullName
        || [issue.reporterId?.firstName, issue.reporterId?.lastName].filter(Boolean).join(' ')
        || issue.reporterId?.email
        || 'Unknown user',
    },
    description: issue.description || issue.issue || '',
    venue: issue.venue || issue.venueId?.name || issue.seatId?.venueId?.name || 'Unknown venue',
    seat: issue.seat || issue.seatId?.label || issue.seatId?.number || 'Unknown seat',
  }
}

function normalizeReport(report) {
  const assessment = normalizeAssessment(report.assessment || {})
  const counts = report.counts || {}
  const enrolled = counts.enrolled || 0
  const checkedIn = counts.verified || 0
  const status = assessment.status || 'upcoming'

  return {
    module: `${assessment.moduleCode} — ${assessment.name}`.trim(),
    type: assessment.type || 'Type not set',
    lab: assessment.venue?.name || 'Unknown venue',
    date: assessment.date,
    time: `${assessment.startTime || '--:--'}–${assessment.endTime || '--:--'}`,
    checked: `${checkedIn}/${enrolled}`,
    incidents: report.counts?.pending || 0,
    expelled: report.counts?.expelled || 0,
    status: String(status)
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    _id: assessment._id,
  }
}

function normalizeAllocation(allocation) {
  const student = allocation.studentId || {}
  const seat = allocation.seatId || {}
  return {
    ...allocation,
    seatId: seat._id || allocation.seatId || null,
    student: {
      name: [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Unknown student',
      studentNumber: student.studentNumber || '—',
      eligibility: student.eligibility || '—',
    },
    seat: seat.label || seat.number || 'Unassigned',
    seatCondition: seat.condition || null,
    condition: seat.condition || '—',
    checkedIn: Boolean(allocation.verifiedAt || allocation.checkedInAt),
    verifiedAt: allocation.verifiedAt || null,
    verifiedBy: allocation.verifiedBy
      ? [allocation.verifiedBy.firstName, allocation.verifiedBy.lastName].filter(Boolean).join(' ')
      : '',
    status: allocation.status || 'pending',
  }
}

function App() {
  // The app shell owns shared records so updates stay consistent between pages.
  const [screen, setScreen] = useState(() => (getStoredUser() ? 'dashboard' : 'login'))
  const [page, setPage] = useState('overview')
  const [admin, setAdmin] = useState(() => getStoredUser())
  const [users, setUsers] = useState(() => (hasApi ? [] : initialStudents))
  const [issues, setIssues] = useState(() => (hasApi ? [] : initialIssues))
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState('')
  const [assessments, setAssessments] = useState(() => (hasApi ? [] : initialAssessments))
  const [sessions, setSessions] = useState([])
  const [alerts, setAlerts] = useState([])
  const [venues, setVenues] = useState([])
  const [seats, setSeats] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [seatsError, setSeatsError] = useState('')
  const [modules, setModules] = useState([])
  const [qualifications, setQualifications] = useState(qualificationCatalog)
  const [assessmentDetail, setAssessmentDetail] = useState(null)
  const [assessmentStudents, setAssessmentStudents] = useState([])
  const [assessmentMapSeats, setAssessmentMapSeats] = useState([])
  const [assessmentDetailLoading, setAssessmentDetailLoading] = useState(false)
  const [assessmentDetailError, setAssessmentDetailError] = useState('')
  const [reportRange, setReportRange] = useState('Today')
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState('')
  const [reportAttendance, setReportAttendance] = useState([])
  const [reportAbsences, setReportAbsences] = useState([])
  const [selectedAttendanceReport, setSelectedAttendanceReport] = useState(null)
  const [reportAttendanceLoading, setReportAttendanceLoading] = useState(false)
  const [reportAttendanceError, setReportAttendanceError] = useState('')
  const [issueDetail, setIssueDetail] = useState(null)
  const [issueMessages, setIssueMessages] = useState([])
  const [issueDetailLoading, setIssueDetailLoading] = useState(false)
  const [issueDetailError, setIssueDetailError] = useState('')
  const [loading, setLoading] = useState(hasApi && Boolean(admin))
  const [loadError, setLoadError] = useState('')

  async function loadPortalData() {
    if (!hasApi || !admin) return

    setLoading(true)
    setLoadError('')
    try {
      const [usersResult, issuesResult, assessmentsResult, alertsResult, venuesResult, modulesResult, qualificationsResult] = await Promise.all([
        request('/users'),
        request('/issues'),
        request('/assessments'),
        request('/alerts'),
        request('/venues'),
        request('/modules'),
        request('/qualifications'),
      ])
      const loadedUsers = Array.isArray(usersResult) ? usersResult : usersResult.data || []
      setUsers(loadedUsers)
      setIssues((Array.isArray(issuesResult) ? issuesResult : issuesResult.data || []).map(normalizeIssue))
      setAssessments((Array.isArray(assessmentsResult) ? assessmentsResult : assessmentsResult.data || []).map(normalizeAssessment))
      setAlerts(Array.isArray(alertsResult) ? alertsResult : alertsResult.data || [])
      setVenues(Array.isArray(venuesResult) ? venuesResult : venuesResult.data || [])
      setModules(Array.isArray(modulesResult) ? modulesResult : modulesResult.data || [])
      setQualifications(Array.isArray(qualificationsResult) ? qualificationsResult : qualificationsResult.data || [])
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadIssues = useCallback(async () => {
    if (!hasApi || !admin) return
    setIssuesLoading(true)
    setIssuesError('')
    try {
      const result = await request('/issues')
      setIssues((Array.isArray(result) ? result : result.data || []).map(normalizeIssue))
    } catch (error) {
      setIssuesError(error.message)
    } finally {
      setIssuesLoading(false)
    }
  }, [admin])

  async function loadReportData(range = reportRange) {
    if (!hasApi || !admin) return
    const now = new Date()
    const from = new Date(now)
    if (range === 'This week') from.setDate(now.getDate() - 6)
    if (range === 'This month') from.setDate(1)
    const formatQueryDate = (date) => date.toISOString().slice(0, 10)
    const dateRange = range === 'All time'
      ? ''
      : `?from=${formatQueryDate(from)}&to=${formatQueryDate(now)}`

    setReportsLoading(true)
    setReportsError('')
    try {
      const result = await request(`/reports/sessions${dateRange}`)
      setSessions((Array.isArray(result) ? result : result.data || []).map(normalizeReport))
    } catch (error) {
      setReportsError(error.message)
    } finally {
      setReportsLoading(false)
    }

  }

  async function loadReportAttendance(session) {
    setSelectedAttendanceReport(session)
    setReportAttendance([])
    setReportAbsences([])
    setReportAttendanceLoading(true)
    setReportAttendanceError('')
    try {
      if (hasApi) {
        const [allocationsResult, absencesResult] = await Promise.all([
          request(`/assessments/${session._id}/students`),
          request(`/assessments/${session._id}/absence`),
        ])
        const allocations = Array.isArray(allocationsResult) ? allocationsResult : allocationsResult.data || []
        setReportAttendance(allocations.map(normalizeAllocation))
        setReportAbsences(Array.isArray(absencesResult) ? absencesResult : absencesResult.data || [])
      }
    } catch (error) {
      setReportAttendanceError(error.message)
    } finally {
      setReportAttendanceLoading(false)
    }
  }

  async function loadSeats(venue) {
    setSelectedVenue(venue)
    setSeatsLoading(true)
    setSeatsError('')
    try {
      if (hasApi) {
        const result = await request(`/seats?venueId=${encodeURIComponent(venue._id)}`)
        setSeats(Array.isArray(result) ? result : result.data || [])
      } else {
        setSeats([])
      }
    } catch (error) {
      setSeatsError(error.message)
      setSeats([])
    } finally {
      setSeatsLoading(false)
    }
  }

  async function updateSeatCondition(seatId, condition) {
    const updated = hasApi
      ? await request(`/seats/${seatId}/condition`, {
        method: 'PATCH',
        body: JSON.stringify({ condition }),
      })
      : { _id: seatId, condition }
    setSeats((currentSeats) => currentSeats.map((seat) => (
      seat._id === seatId ? { ...seat, ...updated } : seat
    )))
  }

  async function markAlertRead(alertId) {
    if (hasApi) await request(`/alerts/${alertId}/read`, { method: 'POST' })
    setAlerts((current) => current.map((alert) => alert._id === alertId ? { ...alert, read: true } : alert))
  }

  const unreadAlertCount = alerts.filter((alert) => !alert.read).length

  useEffect(() => {
    loadPortalData()
  }, [admin])

  useEffect(() => {
    if (!hasApi || !admin) return undefined

    async function refreshAlerts() {
      try {
        const result = await request('/alerts')
        setAlerts(Array.isArray(result) ? result : result.data || [])
      } catch (error) {
        console.warn('Could not refresh alerts:', error)
      }
    }

    const interval = setInterval(refreshAlerts, 30000)
    window.addEventListener('focus', refreshAlerts)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refreshAlerts)
    }
  }, [admin])

  useEffect(() => {
    loadReportData()
  }, [admin, reportRange])

  useEffect(() => {
    function handleUnauthorized() {
      setAdmin(null)
      setScreen('login')
      setPage('overview')
    }
    window.addEventListener('intelliseat:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('intelliseat:unauthorized', handleUnauthorized)
  }, [])

  // Keep page changes in one place so sidebar and dashboard actions behave alike.
  function navigate(nextPage) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function updateEligibility(studentId, eligibility, reason) {
    if (import.meta.env.VITE_API_URL) {
      await request(`/students/${studentId}/eligibility`, {
        method: 'PATCH',
        body: JSON.stringify({ eligibility, reason }),
      })
    }
    setUsers((currentUsers) => currentUsers.map((user) => (
      user._id === studentId ? { ...user, eligibility } : user
    )))
  }

  async function resolveIssue(issueId, status = 'resolved') {
    const updated = import.meta.env.VITE_API_URL
      ? normalizeIssue(await request(`/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...(status === 'resolved' ? { confirmResolution: true } : {}) }),
      }))
      : { ...issues.find((issue) => issue._id === issueId), status }
    setIssues((currentIssues) => currentIssues.map((issue) => (
      issue._id === issueId ? { ...issue, ...updated } : issue
    )))
    if (issueDetail?._id === issueId) {
      setIssueDetail((currentIssue) => ({ ...currentIssue, ...updated }))
    }
  }

  async function loadIssueDetail(issueId) {
    setIssueDetailLoading(true)
    setIssueDetailError('')
    try {
      const selected = issues.find((issue) => issue._id === issueId)
      if (hasApi) {
        const [issueResult, messagesResult] = await Promise.all([
          request(`/issues/${issueId}`),
          request(`/issues/${issueId}/messages`),
        ])
        setIssueDetail(normalizeIssue(issueResult))
        setIssueMessages(Array.isArray(messagesResult) ? messagesResult : messagesResult.data || [])
      } else {
        setIssueDetail(selected || null)
        setIssueMessages([])
      }
    } catch (error) {
      setIssueDetailError(error.message)
      setIssueDetail(null)
      setIssueMessages([])
    } finally {
      setIssueDetailLoading(false)
    }
  }

  async function replyToIssue(issueId, body) {
    const result = hasApi
      ? await request(`/issues/${issueId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      : { _id: crypto.randomUUID(), body, createdAt: new Date().toISOString(), senderId: admin }
    setIssueMessages((currentMessages) => [...currentMessages, result])
    return result
  }

  async function addUser(user) {
    const result = import.meta.env.VITE_API_URL
      ? await request('/users/invite', { method: 'POST', body: JSON.stringify(user) })
      : { user: { ...user, _id: crypto.randomUUID(), eligibility: user.role === 'student' ? 'eligible' : undefined } }
    setUsers((currentUsers) => [result.user, ...currentUsers])
    return result
  }

  async function updateUser(userId, changes) {
    const updated = await request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    setUsers((currentUsers) => currentUsers.map((user) => user._id === userId ? updated : user))
    return updated
  }

  async function resetUserPassword(userId, password) {
    const result = await request(`/users/${userId}/password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    return result
  }

  async function reactivateUser(userId) {
    const updated = await request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: 'active', isActive: true }),
    })
    setUsers((currentUsers) => currentUsers.map((user) => user._id === userId ? updated : user))
    return updated
  }

  async function deleteUser(userId, mode) {
    const result = await request(`/users/${userId}?mode=${mode}`, { method: 'DELETE' })
    if (mode === 'hard') {
      setUsers((currentUsers) => currentUsers.filter((user) => user._id !== userId))
      return null
    }
    setUsers((currentUsers) => currentUsers.map((user) => user._id === userId ? result.user : user))
    return result.user
  }

  async function addAssessment(assessment) {
    const payload = {
      moduleName: assessment.moduleName,
      qualification: assessment.qualification,
      qualificationYear: assessment.qualificationYear,
      name: assessment.name,
      type: assessment.type,
      startsAt: `${assessment.date}T${assessment.startTime}:00`,
      endsAt: `${assessment.date}T${assessment.endTime}:00`,
      venueId: assessment.venueId,
      invigilatorIds: [],
      instructions: assessment.instructions,
    }
    const created = hasApi
      ? normalizeAssessment(await request('/assessments', { method: 'POST', body: JSON.stringify(payload) }))
      : { ...assessment, moduleCode: assessment.moduleName }
    if (created.type !== assessment.type) {
      throw new Error('The API did not return the saved assessment type. Restart or deploy the updated backend, then save this assessment type again.')
    }
    if (created.moduleId?._id) {
      const newModule = {
        ...created.moduleId,
        course: created.qualification,
        year: created.qualificationYear,
      }
      setModules((currentModules) => [
        newModule,
        ...currentModules.filter((module) => module._id !== newModule._id),
      ])
    }
    setAssessments((currentAssessments) => [created, ...currentAssessments])
  }

  async function updateAssessment(assessmentId, assessment) {
    const payload = {
      moduleName: assessment.moduleName,
      qualification: assessment.qualification,
      qualificationYear: assessment.qualificationYear,
      name: assessment.name,
      type: assessment.type,
      startsAt: `${assessment.date}T${assessment.startTime}:00`,
      endsAt: `${assessment.date}T${assessment.endTime}:00`,
      venueId: assessment.venueId,
      invigilatorIds: [],
      instructions: assessment.instructions,
    }
    const updated = hasApi
      ? normalizeAssessment(await request(`/assessments/${assessmentId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }))
      : { ...assessment, _id: assessmentId, moduleCode: assessment.moduleName }
    if (updated.type !== assessment.type) {
      throw new Error('The API did not return the saved assessment type. Restart or deploy the updated backend, then save this assessment type again.')
    }
    setAssessments((current) => current.map((item) => item._id === assessmentId ? updated : item))
    await loadAssessmentDetail(assessmentId)
    return updated
  }

  async function cancelAssessment(assessmentId) {
    const updated = hasApi
      ? normalizeAssessment(await request(`/assessments/${assessmentId}`, { method: 'DELETE' }))
      : { ...assessments.find((item) => item._id === assessmentId), status: 'cancelled', cancelledAt: new Date().toISOString() }
    setAssessments((current) => current.map((item) => item._id === assessmentId ? updated : item))
    setAssessmentDetail(updated)
    return updated
  }

  async function deleteAssessment(assessmentId) {
    if (hasApi) {
      await request(`/assessments/${assessmentId}`, { method: 'DELETE' })
    }
    setAssessments((current) => current.filter((item) => item._id !== assessmentId))
    setAssessmentDetail(null)
  }

  async function restoreAssessment(assessmentId) {
    const updated = hasApi
      ? normalizeAssessment(await request(`/assessments/${assessmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ restore: true }),
      }))
      : { ...assessments.find((item) => item._id === assessmentId), status: 'upcoming', cancelledAt: null }
    setAssessments((current) => current.map((item) => item._id === assessmentId ? updated : item))
    await loadAssessmentDetail(assessmentId)
    return updated
  }

  async function loadAssessmentDetail(assessmentId) {
    setAssessmentDetailLoading(true)
    setAssessmentDetailError('')
    setAssessmentMapSeats([])
    try {
      if (hasApi) {
        const detail = await request(`/assessments/${assessmentId}`)
        const [students, seats] = await Promise.all([
          request(`/assessments/${assessmentId}/students`),
          detail.venueId?._id
            ? request(`/assessments/${assessmentId}/seats`)
            : Promise.resolve([]),
        ])
        setAssessmentDetail(normalizeAssessment(detail))
        setAssessmentStudents((Array.isArray(students) ? students : students.data || []).map(normalizeAllocation))
        setAssessmentMapSeats(Array.isArray(seats) ? seats : seats.data || [])
      } else {
        const selected = assessments.find((assessment) => assessment._id === assessmentId)
        setAssessmentDetail(selected || null)
        setAssessmentStudents([])
        setAssessmentMapSeats([])
      }
    } catch (error) {
      setAssessmentDetailError(error.message)
      setAssessmentDetail(null)
      setAssessmentStudents([])
      setAssessmentMapSeats([])
    } finally {
      setAssessmentDetailLoading(false)
    }
  }

  async function addAlert(alert) {
    const created = import.meta.env.VITE_API_URL
      ? await request('/alerts', { method: 'POST', body: JSON.stringify(alert) })
      : { ...alert, _id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setAlerts((currentAlerts) => [created, ...currentAlerts])
    return created
  }

  async function logIn(credentials) {
    const result = import.meta.env.VITE_API_URL
      ? await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
      : { token: 'demo-token', user: { name: credentials.email, email: credentials.email } }
    setAuth(result)
    setAdmin(result.user)
    setScreen('dashboard')
  }

  function logOut() {
    setScreen('login')
    setPage('overview')
    clearAuth()
    setAdmin(null)
  }

  // Each page receives only the data and actions it needs.
  function renderPage() {
    switch (page) {
      case 'users':
        return <CreateUsers onCreate={addUser} qualifications={qualifications} />
      case 'manage-users':
        return <ManageUsers users={users} onUpdate={updateUser} onResetPassword={resetUserPassword} onReactivate={reactivateUser} onDelete={deleteUser} qualifications={qualifications} />
      case 'eligibility':
        return (
          <Eligibility
            students={users.filter((user) => user.role === 'student')}
            onUpdate={updateEligibility}
          />
        )
      case 'assessments':
        return (
          <Assessments
            assessments={assessments}
            venues={venues}
            modules={modules}
            qualifications={qualifications}
            onCreate={addAssessment}
            onUpdate={updateAssessment}
            onCancel={cancelAssessment}
            onDelete={deleteAssessment}
            onRestore={restoreAssessment}
            detail={assessmentDetail}
            students={assessmentStudents}
            mapSeats={assessmentMapSeats}
            detailLoading={assessmentDetailLoading}
            detailError={assessmentDetailError}
            onSelect={loadAssessmentDetail}
            onCloseDetail={() => setAssessmentDetail(null)}
          />
        )
      case 'venues':
        return (
          <Venues
            venues={venues}
            seats={seats}
            selectedVenue={selectedVenue}
            loading={seatsLoading}
            error={seatsError}
            onSelect={loadSeats}
            onConditionChange={updateSeatCondition}
          />
        )
      case 'reports':
        return (
          <Reports
            sessions={sessions}
            range={reportRange}
            onRangeChange={setReportRange}
            loading={reportsLoading}
            error={reportsError}
            selectedSession={selectedAttendanceReport}
            attendance={reportAttendance}
            absences={reportAbsences}
            attendanceLoading={reportAttendanceLoading}
            attendanceError={reportAttendanceError}
            onSelectSession={loadReportAttendance}
            onCloseAttendance={() => setSelectedAttendanceReport(null)}
          />
        )
      case 'support':
        return (
          <Support
            issues={issues}
            issuesLoading={issuesLoading}
            issuesError={issuesError}
            onRefresh={loadIssues}
            onResolve={resolveIssue}
            detail={issueDetail}
            messages={issueMessages}
            detailLoading={issueDetailLoading}
            detailError={issueDetailError}
            onSelect={loadIssueDetail}
            onCloseDetail={() => setIssueDetail(null)}
            onReply={replyToIssue}
          />
        )
      case 'alerts':
        return <Alerts alerts={alerts} onCreate={addAlert} onRead={markAlertRead} />
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
            <span className="today-label">{todayLabel}</span>
            <button
              type="button"
              className="notification-button"
              aria-label={`Notifications${unreadAlertCount ? `, ${unreadAlertCount} unread` : ''}`}
              onClick={() => navigate('alerts')}
            >
              ♧{unreadAlertCount > 0 && <i>{unreadAlertCount > 99 ? '99+' : unreadAlertCount}</i>}
            </button>
            <span className="top-avatar">{(admin?.name || admin?.email || '?').slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <div className="page-content">
          {loadError && (
            <div className="notice notice-error" role="alert">
              Could not load portal data: {loadError}
              <button type="button" className="table-action" onClick={loadPortalData}>Retry</button>
            </div>
          )}
          {loading && <p className="empty-state" role="status">Loading portal data...</p>}
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
