import React from 'react';

interface ProfileCustomizerIconProps {
  size?: number;
  className?: string;
}

const AppIcon: React.FC<ProfileCustomizerIconProps> = ({ size = 32, className = '', }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        className="w-full h-full"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="text-blue-500" style={{ stopColor: 'currentColor' }} />
            <stop offset="100%" className="text-blue-600" style={{ stopColor: 'currentColor' }} />
          </linearGradient>
        </defs>

        {/* Main circle background */}
        <circle cx="64" cy="64" r="60" fill="url(#bg-gradient)" />

        {/* Centered GitHub cat silhouette */}
        <path
          d="M64 35c-16.5 0-30 13.5-30 30 0 13.3 8.6 24.5 20.5 28.5 1.5 0.3 2-0.6 2-1.4 0-0.7 0-2.5-0.1-5-8.3 1.8-10.1-4-10.1-4-1.4-3.5-3.3-4.4-3.3-4.4-2.7-1.9 0.2-1.8 0.2-1.8 3 0.2 4.6 3.1 4.6 3.1 2.7 4.6 7 3.3 8.7 2.5 0.3-2 1-3.3 1.9-4.1-6.7-0.8-13.7-3.4-13.7-14.8 0-3.3 1.2-5.9 3.1-8-0.3-0.8-1.3-3.8 0.3-7.9 0 0 2.5-0.8 8.3 3.1 2.4-0.7 5-1 7.5-1 2.5 0 5.1 0.3 7.5 1 5.7-3.9 8.3-3.1 8.3-3.1 1.6 4.1 0.6 7.1 0.3 7.9 1.9 2.1 3.1 4.7 3.1 8 0 11.5-7 14-13.7 14.8 1.1 0.9 2 2.7 2 5.5 0 4-0.1 7.2-0.1 8.2 0 0.8 0.5 1.7 2 1.4C85.4 89.5 94 78.3 94 65c0-16.5-13.5-30-30-30z"
          className="fill-white"
          fillOpacity="0.95"
        />

        {/* Sparkle effects */}
        <g className="fill-white" fillOpacity="0.9">
          {/* Top sparkle */}
          <path d="M82 24l4-8 4 8-4 8z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M78 28l8-4 8 4-8 4z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </path>

          {/* Bottom right sparkle */}
          <path d="M98 88l3-6 3 6-3 6z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
              begin="0.7s"
            />
          </path>
          <path d="M95 91l6-3 6 3-6 3z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
              begin="1.2s"
            />
          </path>

          {/* Left sparkle */}
          <path d="M30 72l2-4 2 4-2 4z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          </path>
          <path d="M28 74l4-2 4 2-4 2z">
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="2s"
              repeatCount="indefinite"
              begin="0.8s"
            />
          </path>
        </g>
      </svg>
    </div>
  );
};

export default AppIcon;