import { Link } from 'react-router-dom'

function BrandMark({ compact = false }) {
  const size = compact ? 34 : 42

  return (
    <div
      className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="brand-mark-core brand-mark-lettering">
        <span className="brand-mark-c">C</span>
        <span className="brand-mark-v">V</span>
      </div>
      <div className="brand-mark-glow" />
    </div>
  )
}

export default function BrandLogo({ to = '/', compact = false, showTagline = false, className = '' }) {
  return (
    <Link to={to} className={`brand-logo ${className}`.trim()}>
      <BrandMark compact={compact} />
      <div className="brand-copy">
        <div className="brand-wordmark">
          <span className="brand-wordmark-cv">
            <span className="brand-wordmark-c">C</span>
            <span className="brand-wordmark-v">V</span>
          </span>
          <span className="brand-wordmark-ision">ISION</span>
        </div>
        {showTagline && <span className="brand-tagline">Smart resumes, sharper results</span>}
      </div>
    </Link>
  )
}
