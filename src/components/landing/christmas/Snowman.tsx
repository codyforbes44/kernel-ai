import { ANIMATION_TIMING } from './constants';

export function Snowman() {
  return (
    <div 
      className="absolute bottom-16 right-12 motion-reduce:hidden z-20"
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      <div className="relative">
        {/* Head that tracks the snowblower */}
        <div 
          className="absolute -top-[52px] left-1/2 -translate-x-1/2"
          style={{ 
            animation: `snowmanWatch ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
            transformOrigin: 'center bottom',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="snowballHead" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e8f0f8" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="16" fill="url(#snowballHead)" stroke="#d0dce8" strokeWidth="0.5" />
            
            {/* Coal eyes */}
            <circle cx="12" cy="14" r="2.5" fill="#1a1a1a" />
            <circle cx="24" cy="14" r="2.5" fill="#1a1a1a" />
            <circle cx="11" cy="13" r="0.8" fill="#4a4a4a" />
            <circle cx="23" cy="13" r="0.8" fill="#4a4a4a" />
            
            {/* Carrot nose */}
            <polygon points="18,17 18,19 26,18" fill="#f97316" stroke="#ea580c" strokeWidth="0.3" />
            
            {/* Smile */}
            <circle cx="12" cy="24" r="1.2" fill="#1a1a1a" />
            <circle cx="15" cy="26" r="1.2" fill="#1a1a1a" />
            <circle cx="18" cy="27" r="1.2" fill="#1a1a1a" />
            <circle cx="21" cy="26" r="1.2" fill="#1a1a1a" />
            <circle cx="24" cy="24" r="1.2" fill="#1a1a1a" />
          </svg>
          
          {/* Top hat */}
          <svg 
            width="32" 
            height="24" 
            viewBox="0 0 32 24" 
            className="absolute -top-[18px] left-1/2 -translate-x-1/2"
          >
            <rect x="4" y="18" width="24" height="4" rx="1" fill="#1f2937" />
            <rect x="8" y="2" width="16" height="18" rx="1" fill="#1f2937" />
            <rect x="8" y="12" width="16" height="3" fill="#dc2626" />
          </svg>
        </div>
        
        {/* Middle snowball (torso) */}
        <svg width="50" height="45" viewBox="0 0 50 45" className="relative">
          <defs>
            <radialGradient id="snowballMiddle" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e8f0" />
            </radialGradient>
          </defs>
          <ellipse cx="25" cy="22" rx="22" ry="20" fill="url(#snowballMiddle)" stroke="#d0dce8" strokeWidth="0.5" />
          
          {/* Coal buttons */}
          <circle cx="25" cy="12" r="2" fill="#1a1a1a" />
          <circle cx="25" cy="22" r="2" fill="#1a1a1a" />
          <circle cx="25" cy="32" r="2" fill="#1a1a1a" />
          
          {/* Scarf */}
          <path 
            d="M8 8 Q25 14 42 8" 
            stroke="#dc2626" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M40 8 L44 18 L40 18 L42 28" 
            stroke="#dc2626" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Left arm (stick) */}
        <svg 
          width="30" 
          height="20" 
          viewBox="0 0 30 20" 
          className="absolute top-[15px] -left-[22px]"
        >
          <path 
            d="M28 10 L8 8 L4 4 M8 8 L6 14" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Right arm (waves) */}
        <svg 
          width="30" 
          height="25" 
          viewBox="0 0 30 25" 
          className="absolute top-[10px] -right-[22px]"
          style={{ 
            transformOrigin: 'left center',
            animation: `snowmanWave ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
          }}
        >
          <path 
            d="M2 12 L22 10 L26 4 M22 10 L24 16" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Bottom snowball (base) */}
        <svg width="65" height="40" viewBox="0 0 65 40" className="absolute top-[32px] -left-[7px]">
          <defs>
            <radialGradient id="snowballBase" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dce4ed" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="22" rx="30" ry="18" fill="url(#snowballBase)" stroke="#d0dce8" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
