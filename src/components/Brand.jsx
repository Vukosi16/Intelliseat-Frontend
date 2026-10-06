export default function Brand({ className = '' }) {
  return (
    <span className={`brand ${className}`}>
      <span className="brand-mark">I</span>
      <span>Intelli<span className="brand-accent">Seat</span></span>
    </span>
  )
}
