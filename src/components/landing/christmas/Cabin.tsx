import { useMemo } from 'react';

export function Cabin() {
  // Generate smoke puffs
  const smokePuffs = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: 8 + (i % 3) * 4,
      delay: i * 0.8,
      duration: 3 + (i % 2),
      offsetX: (i % 2 === 0 ? -1 : 1) * (i * 3),
    })),
  []);

  return (
    <div 
      className="absolute bottom-20 left-8 motion-reduce:hidden z-5"
      style={{ 
        transform: 'translateZ(0) scale(0.9)',
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
      }}
    >
      <div className="relative">
        {/* Chimney smoke */}
        <div className="absolute -top-16 left-[72px] pointer-events-none">
          {smokePuffs.map((puff) => (
            <div
              key={puff.id}
              className="absolute rounded-full"
              style={{
                width: `${puff.size}px`,
                height: `${puff.size}px`,
                background: 'radial-gradient(circle, rgba(200, 200, 210, 0.6) 0%, rgba(180, 180, 190, 0.3) 50%, transparent 100%)',
                animation: `chimneySmoke ${puff.duration}s ease-out infinite`,
                animationDelay: `${puff.delay}s`,
                ['--smoke-drift' as string]: `${puff.offsetX}px`,
              }}
            />
          ))}
        </div>

        <svg width="120" height="100" viewBox="0 0 120 100">
          <defs>
            {/* Wall texture gradient */}
            <linearGradient id="cabinWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#6B3410" />
              <stop offset="100%" stopColor="#5D2E0C" />
            </linearGradient>
            
            {/* Roof gradient */}
            <linearGradient id="cabinRoof" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e8f0f8" />
              <stop offset="100%" stopColor="#c8d8e8" />
            </linearGradient>
            
            {/* Window warm glow */}
            <radialGradient id="windowGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="40%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            
            {/* Window flicker filter */}
            <filter id="windowFlicker">
              <feTurbulence baseFrequency="0.02" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
            </filter>
          </defs>
          
          {/* Main house body */}
          <rect x="15" y="45" width="80" height="55" fill="url(#cabinWall)" rx="2" />
          
          {/* Log texture lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line 
              key={i}
              x1="15" 
              y1={52 + i * 11} 
              x2="95" 
              y2={52 + i * 11} 
              stroke="#4a2c0a" 
              strokeWidth="1" 
              opacity="0.4"
            />
          ))}
          
          {/* Snowy roof */}
          <path 
            d="M5 48 L55 15 L105 48 Z" 
            fill="url(#cabinRoof)" 
            stroke="#b8c8d8" 
            strokeWidth="1"
          />
          
          {/* Roof overhang snow */}
          <path 
            d="M3 48 Q8 52 15 48 Q25 53 35 48 Q45 52 55 47 Q65 52 75 48 Q85 53 95 48 Q102 52 107 48" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Icicles */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${12 + i * 14} 50 L${14 + i * 14} ${56 + (i % 3) * 4} L${16 + i * 14} 50`}
              fill="#e0f0ff"
              opacity="0.8"
            />
          ))}
          
          {/* Chimney */}
          <rect x="70" y="20" width="14" height="30" fill="#8B4513" stroke="#5D2E0C" strokeWidth="1" />
          <rect x="68" y="18" width="18" height="4" fill="#6B3410" rx="1" />
          {/* Chimney snow cap */}
          <path d="M67 18 Q77 14 87 18" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Door */}
          <rect x="45" y="65" width="20" height="35" fill="#5D2E0C" rx="2" />
          <rect x="47" y="67" width="16" height="31" fill="#4a2c0a" rx="1" />
          {/* Door handle */}
          <circle cx="60" cy="82" r="1.5" fill="#fbbf24" />
          
          {/* Door wreath */}
          <circle cx="55" cy="75" r="5" fill="none" stroke="#15803d" strokeWidth="3" />
          <circle cx="55" cy="72" r="1.2" fill="#dc2626" />
          <circle cx="52" cy="75" r="1" fill="#dc2626" />
          <circle cx="58" cy="75" r="1" fill="#dc2626" />
          <path d="M53 70 L55 68 L57 70" stroke="#dc2626" strokeWidth="1.5" fill="none" />
          
          {/* Left window with warm glow */}
          <g>
            <rect x="22" y="55" width="16" height="20" fill="url(#windowGlow)" rx="1">
              <animate 
                attributeName="opacity" 
                values="0.9;1;0.85;1;0.95;1" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </rect>
            {/* Window frame */}
            <rect x="22" y="55" width="16" height="20" fill="none" stroke="#4a2c0a" strokeWidth="2" rx="1" />
            <line x1="30" y1="55" x2="30" y2="75" stroke="#4a2c0a" strokeWidth="1.5" />
            <line x1="22" y1="65" x2="38" y2="65" stroke="#4a2c0a" strokeWidth="1.5" />
            {/* Window snow */}
            <path d="M21 55 Q26 53 30 55 Q34 53 39 55" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          
          {/* Right window with warm glow */}
          <g>
            <rect x="72" y="55" width="16" height="20" fill="url(#windowGlow)" rx="1">
              <animate 
                attributeName="opacity" 
                values="1;0.9;1;0.85;0.95;1" 
                dur="2.5s" 
                repeatCount="indefinite" 
              />
            </rect>
            {/* Window frame */}
            <rect x="72" y="55" width="16" height="20" fill="none" stroke="#4a2c0a" strokeWidth="2" rx="1" />
            <line x1="80" y1="55" x2="80" y2="75" stroke="#4a2c0a" strokeWidth="1.5" />
            <line x1="72" y1="65" x2="88" y2="65" stroke="#4a2c0a" strokeWidth="1.5" />
            {/* Window snow */}
            <path d="M71 55 Q76 53 80 55 Q84 53 89 55" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          
          {/* Window light glow effect */}
          <ellipse 
            cx="30" cy="75" rx="12" ry="6" 
            fill="#fcd34d" 
            opacity="0.15"
            style={{ filter: 'blur(4px)' }}
          />
          <ellipse 
            cx="80" cy="75" rx="12" ry="6" 
            fill="#fcd34d" 
            opacity="0.15"
            style={{ filter: 'blur(4px)' }}
          />
          
          {/* Snow pile at base */}
          <ellipse cx="55" cy="100" rx="55" ry="8" fill="#f0f8ff" />
          <ellipse cx="30" cy="100" rx="20" ry="5" fill="#e8f4ff" />
          <ellipse cx="80" cy="100" rx="18" ry="4" fill="#e8f4ff" />
        </svg>
        
        {/* Warm light spill from windows */}
        <div 
          className="absolute bottom-0 left-6 w-8 h-4 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(252, 211, 77, 0.3) 0%, transparent 70%)',
            filter: 'blur(3px)',
            animation: 'windowLightPulse 3s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute bottom-0 right-6 w-8 h-4 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(252, 211, 77, 0.3) 0%, transparent 70%)',
            filter: 'blur(3px)',
            animation: 'windowLightPulse 2.5s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />
      </div>
    </div>
  );
}
