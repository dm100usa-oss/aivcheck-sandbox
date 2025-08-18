import React from "react";

interface DonutProps {
  score: number;
}

function getColor(score: number) {
  if (score < 31) return "text-red-500";
  if (score < 61) return "text-yellow-500";
  return "text-green-500";
}

const Donut: React.FC<DonutProps> = ({ score }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb" // серый фон (Tailwind gray-200)
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          className={getColor(score)}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="mt-2 text-xl font-semibold">{score}%</div>
    </div>
  );
};

export default Donut;
