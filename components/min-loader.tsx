import React from 'react';

export const MinLoader: React.FC = (props) => (
  <svg
      viewBox="0 0 100 100"
      {...props}
    >
    <circle
      fill="none"
      stroke="#fff"
      strokeWidth="4"
      cx="50"
      cy="50"
      r="44"
    />
      <circle
        fill="#fff"
        stroke="#7882f3"
        strokeWidth="3"
        cx="8"
        cy="54"
        r="6"
      >
        <animateTransform
          attributeName="transform"
          dur="2s"
          type="rotate"
          from="0 50 48"
          to="360 50 52"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
);
