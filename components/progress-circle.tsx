import React from 'react';

export const MinLoader: React.FC = () => {
  return (
    <svg
      id="svg"
      width="200"
      height="200"
      viewBox="0 0 100 100"
    >
      <circle
        r="90"
        cx="100"
        cy="100"
        fill="transparent"
        stroke-dasharray="565.48"
        stroke-dashoffset="0"
      />
      <circle
        id="bar"
        r="90"
        cx="100"
        cy="100"
        fill="transparent"
        stroke-dasharray="565.48"
        stroke-dashoffset="0"
      />
    </svg>
  );
};
