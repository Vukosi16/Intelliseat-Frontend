import logo from '../assets/intelliseat_armchair_logo.svg'

export default function Brand({ className = '' }) {
  return (
    <span className={`brand ${className}`}>
      <img className="brand-logo" src={logo} alt="IntelliSeat" />
    </span>
  )
}
