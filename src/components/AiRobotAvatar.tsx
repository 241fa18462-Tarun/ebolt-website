import React from 'react';

interface AiRobotAvatarProps {
  className?: string;
  size?: number;
}

export const AiRobotAvatar: React.FC<AiRobotAvatarProps> = ({
  className = '',
  size = 130,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Soft circular radial glow halo */}
      <div
        className="rounded-full flex items-center justify-center p-2"
        style={{
          width: size + 20,
          height: size + 20,
          background: 'radial-gradient(circle, rgba(200,230,255,0.7) 0%, rgba(225,242,254,0.4) 60%, rgba(240,248,255,0) 80%)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md transition-transform hover:scale-105 duration-300"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E6F2FD" />
              <stop offset="100%" stopColor="#C9E2F8" />
            </linearGradient>

            <linearGradient id="blueAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B1A30" />
              <stop offset="100%" stopColor="#1E3A5F" />
            </linearGradient>

            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Antenna */}
          <rect x="68" y="14" width="4" height="15" rx="2" fill="url(#bodyGrad)" stroke="#B9D5EE" strokeWidth="1" />
          <circle cx="70" cy="12" r="6" fill="url(#blueAccent)" />
          <circle cx="68" cy="10" r="2" fill="#BAE6FD" opacity="0.8" />

          {/* Ears / Headphone pods */}
          {/* Left Ear */}
          <rect x="22" y="44" width="10" height="24" rx="5" fill="url(#blueAccent)" />
          <rect x="24" y="48" width="6" height="16" rx="3" fill="#0284C7" />
          {/* Right Ear */}
          <rect x="108" y="44" width="10" height="24" rx="5" fill="url(#blueAccent)" />
          <rect x="110" y="48" width="6" height="16" rx="3" fill="#0284C7" />

          {/* Head */}
          <rect
            x="28"
            y="26"
            width="84"
            height="62"
            rx="24"
            fill="url(#bodyGrad)"
            stroke="#D3E6F7"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Visor Screen */}
          <rect
            x="36"
            y="34"
            width="68"
            height="46"
            rx="16"
            fill="url(#screenGrad)"
          />

          {/* Glossy reflection on visor */}
          <path
            d="M40 38 Q70 34 98 44 Q96 41 88 38 Q60 35 44 38 Z"
            fill="#FFFFFF"
            opacity="0.15"
          />

          {/* Eyes (Friendly glowing cyan/blue) */}
          {/* Left Eye */}
          <g filter="url(#glow)">
            <ellipse cx="54" cy="56" rx="6" ry="8" fill="url(#eyeGlow)" />
            <circle cx="56" cy="53" r="2.5" fill="#FFFFFF" />
          </g>

          {/* Right Eye */}
          <g filter="url(#glow)">
            <ellipse cx="86" cy="56" rx="6" ry="8" fill="url(#eyeGlow)" />
            <circle cx="88" cy="53" r="2.5" fill="#FFFFFF" />
          </g>

          {/* Cute digital smile */}
          <path
            d="M65 67 Q70 72 75 67"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
          />

          {/* Cute blush cheeks */}
          <ellipse cx="44" cy="65" rx="3" ry="1.5" fill="#38BDF8" opacity="0.3" />
          <ellipse cx="96" cy="65" rx="3" ry="1.5" fill="#38BDF8" opacity="0.3" />

          {/* Neck */}
          <rect x="62" y="86" width="16" height="8" rx="3" fill="#0284C7" />

          {/* Torso / Shoulders */}
          <path
            d="M38 98 C38 92 48 90 70 90 C92 90 102 92 102 98 L108 122 C108 126 100 128 70 128 C40 128 32 126 32 122 Z"
            fill="url(#bodyGrad)"
            stroke="#D3E6F7"
            strokeWidth="1.5"
          />

          {/* Chest badge */}
          <rect x="62" y="98" width="16" height="8" rx="4" fill="url(#blueAccent)" />
          <circle cx="70" cy="102" r="2" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};
