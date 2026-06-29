function Ring({ cx, cy, r, strokeWidth, color, trackColor, progress }) {
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(Math.max(progress, 0), 1))

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
      />
    </g>
  )
}

export default function RingChart({ calorieProgress = 0, exerciseProgress = 0, waterProgress = 0, size = 130 }) {
  const c = size / 2
  const rings = [
    { r: c - 8,  strokeWidth: 10, color: '#00D4FF', trackColor: '#DFFAFE', progress: calorieProgress },
    { r: c - 22, strokeWidth: 9,  color: '#0891B2', trackColor: '#CCEEF7', progress: exerciseProgress },
    { r: c - 35, strokeWidth: 8,  color: '#0E7490', trackColor: '#B9E0EB', progress: waterProgress },
  ]

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {rings.map((ring, i) => (
          <Ring key={i} cx={c} cy={c} {...ring} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl leading-none">🔥</span>
      </div>
    </div>
  )
}
