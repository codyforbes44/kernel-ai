import { ANIMATION_TIMING } from './constants';

export function Snowman() {
  return (
    <div 
      className="absolute bottom-16 right-12 motion-reduce:hidden z-20"
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
        transform: 'translateZ(0)',
        animation: `snowmanSway ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
      }}
    >
      <div className="relative">
        {/* Snow dusting particles that appear when blower passes */}
        <div 
          className="absolute -top-4 left-0 w-full h-20 pointer-events-none"
          style={{
            animation: `snowDusting ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/80"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + Math.random() * 40}%`,
                animation: `snowDustParticle ${1 + Math.random()}s ease-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Head with enhanced face */}
        <div 
          className="absolute -top-[52px] left-1/2 -translate-x-1/2"
          style={{ 
            animation: `snowmanWatch ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
            transformOrigin: 'center bottom',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="snowmanHeadGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e8f0f8" />
              </radialGradient>
              <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffb3b3" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffb3b3" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="16" fill="url(#snowmanHeadGrad)" stroke="#d0dce8" strokeWidth="0.5" />
            
            {/* Rosy cheeks */}
            <ellipse cx="8" cy="20" rx="4" ry="3" fill="url(#blushGrad)" />
            <ellipse cx="28" cy="20" rx="4" ry="3" fill="url(#blushGrad)" />
            
            {/* Animated blinking eyes */}
            <g style={{ animation: 'eyeBlink 4s ease-in-out infinite' }}>
              {/* Left eye */}
              <circle cx="12" cy="14" r="2.5" fill="#1a1a1a" />
              <circle cx="11" cy="13" r="0.8" fill="#4a4a4a" />
              {/* Eye sparkle */}
              <circle cx="13" cy="12.5" r="0.6" fill="#ffffff" />
              
              {/* Right eye */}
              <circle cx="24" cy="14" r="2.5" fill="#1a1a1a" />
              <circle cx="23" cy="13" r="0.8" fill="#4a4a4a" />
              {/* Eye sparkle */}
              <circle cx="25" cy="12.5" r="0.6" fill="#ffffff" />
            </g>
            
            {/* Carrot nose with highlight */}
            <polygon points="18,17 18,19 28,18" fill="#f97316" stroke="#ea580c" strokeWidth="0.3" />
            <line x1="19" y1="17.3" x2="24" y2="17.8" stroke="#fdba74" strokeWidth="0.5" strokeLinecap="round" />
            
            {/* Curved smile */}
            <path 
              d="M11 23 Q18 29 25 23" 
              stroke="#1a1a1a" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
            />
          </svg>
          
          {/* Top hat with holly decoration */}
          <svg 
            width="32" 
            height="28" 
            viewBox="0 0 32 28" 
            className="absolute -top-[20px] left-1/2 -translate-x-1/2"
            style={{ 
              animation: `hatWobble ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
              transformOrigin: 'center bottom',
            }}
          >
            {/* Hat brim */}
            <rect x="4" y="22" width="24" height="4" rx="1" fill="#1f2937" />
            {/* Hat body */}
            <rect x="8" y="4" width="16" height="20" rx="1" fill="#1f2937" />
            {/* Red band */}
            <rect x="8" y="14" width="16" height="3" fill="#dc2626" />
            
            {/* Holly decoration */}
            <g transform="translate(18, 13)">
              {/* Holly leaves */}
              <ellipse cx="-2" cy="0" rx="3" ry="1.5" fill="#15803d" transform="rotate(-30)" />
              <ellipse cx="2" cy="0" rx="3" ry="1.5" fill="#16a34a" transform="rotate(30)" />
              {/* Holly berries */}
              <circle cx="0" cy="-1" r="1.5" fill="#dc2626" />
              <circle cx="-1.5" cy="0.5" r="1.2" fill="#b91c1c" />
              <circle cx="1.5" cy="0.5" r="1.2" fill="#ef4444" />
              {/* Berry highlights */}
              <circle cx="0.3" cy="-1.3" r="0.4" fill="#fca5a5" />
            </g>
          </svg>
        </div>
        
        {/* Middle snowball (torso) */}
        <svg width="50" height="45" viewBox="0 0 50 45" className="relative">
          <defs>
            <radialGradient id="snowmanMiddleGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e8f0" />
            </radialGradient>
          </defs>
          <ellipse cx="25" cy="22" rx="22" ry="20" fill="url(#snowmanMiddleGrad)" stroke="#d0dce8" strokeWidth="0.5" />
          
          {/* Coal buttons with highlights */}
          <circle cx="25" cy="12" r="2" fill="#1a1a1a" />
          <circle cx="24.5" cy="11.5" r="0.5" fill="#4a4a4a" />
          <circle cx="25" cy="22" r="2" fill="#1a1a1a" />
          <circle cx="24.5" cy="21.5" r="0.5" fill="#4a4a4a" />
          <circle cx="25" cy="32" r="2" fill="#1a1a1a" />
          <circle cx="24.5" cy="31.5" r="0.5" fill="#4a4a4a" />
          
          {/* Scarf with flutter animation */}
          <g>
            <path 
              d="M8 8 Q25 14 42 8" 
              stroke="#dc2626" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
            />
            {/* Scarf tail with flutter */}
            <g style={{ 
              animation: `scarfFlutter ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
              transformOrigin: '40px 8px',
            }}>
              <path 
                d="M40 8 L44 18 L40 18 L42 28" 
                stroke="#dc2626" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />
              {/* Scarf stripes */}
              <line x1="41" y1="12" x2="43" y2="12" stroke="#991b1b" strokeWidth="1" />
              <line x1="40.5" y1="20" x2="42" y2="20" stroke="#991b1b" strokeWidth="1" />
              <line x1="41" y1="25" x2="42.5" y2="25" stroke="#991b1b" strokeWidth="1" />
            </g>
          </g>
        </svg>
        
        {/* Left arm (stick with mitten) */}
        <svg 
          width="35" 
          height="25" 
          viewBox="0 0 35 25" 
          className="absolute top-[15px] -left-[26px]"
        >
          {/* Stick arm */}
          <path 
            d="M32 12 L10 10 L6 5 M10 10 L8 16" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* Mitten */}
          <ellipse cx="4" cy="5" rx="4" ry="3" fill="#dc2626" transform="rotate(-20, 4, 5)" />
          <ellipse cx="3" cy="4" rx="1" ry="1.5" fill="#b91c1c" />
        </svg>
        
        {/* Right arm (waves enthusiastically with mitten) */}
        <svg 
          width="35" 
          height="30" 
          viewBox="0 0 35 30" 
          className="absolute top-[8px] -right-[26px]"
          style={{ 
            transformOrigin: 'left center',
            animation: `snowmanWave ${ANIMATION_TIMING.CYCLE_DURATION}s ease-in-out infinite`,
          }}
        >
          {/* Stick arm */}
          <path 
            d="M2 14 L22 12 L28 5 M22 12 L25 18" 
            stroke="#8B4513" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* Waving mitten */}
          <g style={{ 
            animation: `mittenWave 0.3s ease-in-out infinite`,
            transformOrigin: '28px 5px',
          }}>
            <ellipse cx="30" cy="4" rx="4" ry="3" fill="#dc2626" transform="rotate(20, 30, 4)" />
            <ellipse cx="31" cy="3" rx="1" ry="1.5" fill="#b91c1c" />
            {/* Thumb */}
            <ellipse cx="27" cy="3" rx="1.5" ry="2" fill="#dc2626" transform="rotate(-30, 27, 3)" />
          </g>
        </svg>
        
        {/* Bottom snowball (base) */}
        <svg width="65" height="40" viewBox="0 0 65 40" className="absolute top-[32px] -left-[7px]">
          <defs>
            <radialGradient id="snowmanBaseGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dce4ed" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="22" rx="30" ry="18" fill="url(#snowmanBaseGrad)" stroke="#d0dce8" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
