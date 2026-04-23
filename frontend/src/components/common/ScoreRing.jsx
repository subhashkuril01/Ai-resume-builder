export default function ScoreRing({ score = 0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#42825e'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#f97316'
    return '#dc2626'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Needs Work'
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold" style={{ color, fontSize: size * 0.22 }}>{score}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: size * 0.09 }}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
        {getLabel(score)}
      </span>
    </div>
  )
}
