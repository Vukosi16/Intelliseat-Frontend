export default function Notice({ children, type = 'success' }) {
  if (!children) return null
  return <div className={`notice notice-${type}`} role="status">{children}</div>
}
