"use client";

type Props = { percent: number; size?: number };

export default function Donut({ percent, size = 200 }: Props) {
  const p = Math.max(0, Math.min(100, percent));
  const outerStroke = 8;      // thin outer ring (100%)
  const innerStroke = 20;     // thick inner progress ring
  const gapBetween = 10;

  const center = size / 2;
  const outerR = center - outerStroke;
  const innerR = outerR - gapBetween - innerStroke;

  const innerCirc = 2 * Math.PI * innerR;
  const dash = (p / 100) * innerCirc;
  const gap = innerCirc - dash;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* grey base for inner ring */}
        <circle cx={center} cy={center} r={innerR} fill="none" stroke="#E5E7EB" strokeWidth={innerStroke} />
        {/* actual progress */}
        <circle
          cx={center}
          cy={center}
          r={innerR}
          fill="none"
          stroke="#10B981"
          strokeWidth={innerStroke}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* outer 100% ring */}
        <circle cx={center} cy={center} r={outerR} fill="none" stroke="#10B981" strokeWidth={outerStroke} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-3xl font-semibold tabular-nums">{p}%</div>
      </div>
    </div>
  );
}
