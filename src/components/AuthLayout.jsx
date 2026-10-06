import Brand from './Brand.jsx'

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Brand className="brand-large" />
        <div className="story-copy">
          <span className="eyebrow eyebrow-light">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="story-footer">Richfield College · IntelliSeat v1.0</span>
      </section>
      <section className="auth-form-wrap">{children}</section>
    </main>
  )
}
