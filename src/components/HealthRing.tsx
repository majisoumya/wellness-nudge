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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {Array.from({ length: segments }).map((_, i) => {
        const startAngle = i * (segmentAngle + gapAngle) - 90;
        const segmentLength = (segmentAngle / 360) * circumference;
        const offset = circumference - segmentLength;
        const isFilled = i < filled;
        
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isFilled ? "#4F46E5" : "rgba(79, 70, 229, 0.15)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            className={isFilled ? "transition-all duration-700" : ""}
            style={{ opacity: isFilled ? 1 : 0.5 }}
          />
        );
      })}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display font-semibold"
        fill="#334155"
        fontSize="14"
      >
        {filled} of {segments}
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-body"
        fill="rgba(51,65,85,0.5)"
        fontSize="10"
      >
        pauses taken
      </text>
    </svg>
  );
};

export default HealthRing;
