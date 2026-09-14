import React, { useId } from 'react';

interface EboltLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  showText?: boolean;
}

export const EboltLogo: React.FC<EboltLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
  showText = true,
}) => {
  const rawId = useId();
  const clipId = `ebolt-bear-clip-${rawId.replace(/[:/]/g, '')}`;
  const boxSize = size === 'sm' ? 34 : size === 'lg' ? 44 : 38;
  const textSize = size === 'sm' ? 'text-base font-bold' : size === 'lg' ? 'text-2xl font-bold' : 'text-lg font-bold';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      id="ebolt-brand-logo"
    >
      {/* Circular Polar Bear Logo Badge matching uploaded image perfectly */}
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden shadow-2xs transition-transform hover:scale-105 shrink-0 bg-[#80CBFA]"
        style={{ width: boxSize, height: boxSize }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Ebolt Polar Bear Logo"
        >
          <defs>
            {/* Circular clip to keep the bear inside the outer boundary */}
            <clipPath id={clipId}>
              <circle cx="50" cy="50" r="44.5" />
            </clipPath>
          </defs>

          {/* Sky blue background circle */}
          <circle cx="50" cy="50" r="50" fill="#80CBFA" />

          {/* White Circular Ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8.5"
          />

          {/* Polar Bear inside badge, clipped cleanly to circle boundary */}
          <g clipPath={`url(#${clipId})`}>
            {/* White Body & Head silhouette */}
            <path
              d="
                M 17 100
                C 17 84, 22 70, 25 61
                C 26.8 56, 27.5 51, 27.5 46.5
                C 25.5 45, 24.8 42, 25.8 38.5
                C 27 34.8, 30.5 34.2, 33.8 36.5
                C 37 39, 36.8 41, 38.2 42.2
                C 42 39, 45.8 37.5, 50 37.5
                C 54.2 37.5, 58 39, 61.8 42.2
                C 63.2 41, 63 39, 66.2 36.5
                C 69.5 34.2, 73 34.8, 74.2 38.5
                C 75.2 42, 74.5 45, 72.5 46.5
                C 72.5 51, 73.2 56, 75 61
                C 78 70, 83 84, 83 100
                Z
              "
              fill="#FFFFFF"
            />

            {/* Left Eye */}
            <ellipse cx="39.2" cy="51.2" rx="2" ry="3.1" fill="#2D1C12" />

            {/* Right Eye */}
            <ellipse cx="60.8" cy="51.2" rx="2" ry="3.1" fill="#2D1C12" />

            {/* Bear Nose */}
            <path
              d="
                M 45 50.8
                C 44.5 49.2, 46.8 48.4, 50 48.4
                C 53.2 48.4, 55.5 49.2, 55 50.8
                C 54.4 52.6, 52.4 53.8, 51.2 54.8
                C 50.8 55.2, 50.3 55.5, 50 55.5
                C 49.7 55.5, 49.2 55.2, 48.8 54.8
                C 47.6 53.8, 45.6 52.6, 45 50.8
                Z
              "
              fill="#2D1C12"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <span
          className={`tracking-tight ${textSize} ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          Ebolt
        </span>
      )}
    </div>
  );
};


