import { navigation } from '../data/demoData.js'
import Brand from './Brand.jsx'

export default function Sidebar({ active, onNavigate, onLogout, admin }) {
  return (
    <aside className="sidebar">
      <a
        className="sidebar-brand"
        href="#"
        aria-label="IntelliSeat dashboard"
        onClick={(event) => {
          event.preventDefault()
          onNavigate('overview')
        }}
      >
        <Brand />
        <small>Admin Portal</small>
      </a>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="admin-profile">
          <span className="avatar">V</span>
          <span><strong>{admin.split('@')[0]}</strong><small>Administrator</small></span>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>↶ &nbsp;Log out</button>
      </div>
    </aside>
  )
}
