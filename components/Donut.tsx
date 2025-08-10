"use client";

type Props = { percent: number; size?: number };

export default function Donut({ percent, size = 180 }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const outerStroke = 8;
  const innerStroke = 18;
  const outerR = size / 2 - outerStroke;
  const innerR = outerR - innerStroke - 8;
  const center = size / 2;

  const innerCirc = 2 * Math.PI * innerR;
  const dash = (clamped / 100) * innerCirc;
  const gap = innerCirc - dash;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={innerR} fill="none" stroke="#E5E7EB" strokeWidth={innerStroke} />
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
        <circle cx={center} cy={center} r={outerR} fill="none" stroke="#10B981" strokeWidth={outerStroke} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-3xl font-semibold tabular-nums">{clamped}%</div>
      </div>
    </div>
  );
}
