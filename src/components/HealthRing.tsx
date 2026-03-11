import { motion } from "framer-motion";

interface HealthRingProps {
  segments?: number;
  filled?: number;
  size?: number;
}

const HealthRing = ({ segments = 5, filled = 3, size = 140 }: HealthRingProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = 8;
  const totalGap = gapAngle * segments;
  const segmentAngle = (360 - totalGap) / segments;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl overflow-visible">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {Array.from({ length: segments }).map((_, i) => {
        const startAngle = i * (segmentAngle + gapAngle) - 90;
        const segmentLength = (segmentAngle / 360) * circumference;
        const isFilled = i < filled;
        
        return (
          <g key={i} transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(79, 70, 229, 0.1)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference}`}
            />
            {/* Filled Segment */}
            {isFilled && (
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${segmentLength} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                filter="url(#glow)"
              />
            )}
          </g>
        );
      })}
      
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display font-bold"
        fill="#1e1b4b"
        fontSize="20"
      >
        {filled}/{segments}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-body font-medium uppercase"
        fill="#6366f1"
        fontSize="10"
        letterSpacing="0.05em"
      >
        wellness score
      </text>
    </svg>
  );
};

export default HealthRing;
