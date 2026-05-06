import { Link } from 'react-router-dom'

function BrandMark({ compact = false }) {
  const size = compact ? 'w-10 h-10' : 'w-12 h-12'

  return (
    <div className={`${size} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-500`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      <span className="font-display font-black text-black leading-none select-none" style={{ fontSize: compact ? '18px' : '22px' }}>
        CV
      </span>
      {/* Dynamic Glow */}
      <div className="absolute -inset-1 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
    </div>
  )
}

export default function BrandLogo({ to = '/', compact = false, showTagline = false, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-4 group transition-all ${className}`.trim()}>
      <BrandMark compact={compact} />
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-display font-black text-2xl tracking-tighter text-text-primary">
            CV<span className="text-amber-500">ISION</span>
          </span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-white/5 border border-border/50 text-[8px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-amber-500/50 transition-colors">
            Labs
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mt-0.5">
            Smart Resumes • AI Engine
          </span>
        )}
      </div>
    </Link>
  )
}
