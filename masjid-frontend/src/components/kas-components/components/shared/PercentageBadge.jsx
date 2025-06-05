import React from 'react';

const PercentageBadge = ({ percentage, periodText = 'period' }) => {
  // Handle NaN, null, undefined, or invalid percentage values
  if (isNaN(percentage) || percentage === null || percentage === undefined) {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        No data
      </span>
    );
  }

  const isPositive = percentage >= 0;
  const absPercentage = Math.abs(percentage);

  if (absPercentage === 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        No change
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPositive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
      }`}>
      <svg
        className={`w-3 h-3 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
      {isPositive ? '+' : ''}{percentage.toFixed(1)}% from last {periodText}
    </span>
  );
};

export default PercentageBadge;
