import { ANIMATION_TIMING } from './constants';

export function SantaSleigh() {
  return (
    <div 
      className="absolute motion-reduce:hidden"
      style={{
        top: '12%',
        animation: `santaFly ${ANIMATION_TIMING.CYCLE_DURATION}s linear infinite`,
        animationDelay: '3s',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <div 
        className="relative"
        style={{ animation: 'sleighBob 2s ease-in-out infinite' }}
      >
        {/* Reindeer team - 4 reindeer with enhanced animations */}
        <div className="flex items-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative"
              style={{
                marginRight: i < 3 ? '-4px' : '0',
                animation: 'reindeerRun 0.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <svg 
                width="28" 
                height="22" 
                viewBox="0 0 28 22" 
                className="text-amber-900/90 drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]"
              >
                {/* Body */}
                <ellipse cx="14" cy="12" rx="8" ry="5" fill="currentColor" />
                
                {/* Tail wagging */}
                <g style={{ 
                  transformOrigin: '22px 10px',
                  animation: 'tailWag 0.3s ease-in-out infinite',
                }}>
                  <path 
                    d="M21 10 Q24 8 23 12 Q22 14 24 13" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    fill="none"
                  />
                </g>
                
                {/* Head with bobbing animation */}
                <g style={{ 
                  transformOrigin: '6px 9px',
                  animation: 'reindeerHeadBob 0.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}>
                  <circle cx="6" cy="9" r="3.5" fill="currentColor" />
                  {/* Eyes */}
                  <circle cx="4" cy="8" r="0.6" fill="#1a1a1a" />
                  {/* Antlers */}
                  <path 
                    d="M7 6 L8 2 L10 4 M5 6 L4 2 L2 4 M8 3 L9 1 M4 3 L3 1" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    fill="none"
                  />
                  {/* Rudolph's red nose for lead reindeer */}
                  {i === 0 && (
                    <g>
                      <circle cx="3" cy="9" r="1.8" fill="#ef4444" />
                      <circle cx="2.5" cy="8.5" r="0.5" fill="#fca5a5" />
                      {/* Nose glow */}
                      <circle 
                        cx="3" cy="9" r="3" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="0.5" 
                        opacity="0.5"
                        style={{ animation: 'noseGlow 1s ease-in-out infinite' }}
                      />
                    </g>
                  )}
                </g>
                
                {/* Animated running legs */}
                <g style={{ 
                  transformOrigin: '10px 16px',
                  animation: 'legsFront 0.25s ease-in-out infinite',
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <path 
                    d="M10 15 L8 19 M12 16 L11 20" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                  {/* Hooves */}
                  <circle cx="8" cy="19.5" r="0.8" fill="#1a1a1a" />
                  <circle cx="11" cy="20.5" r="0.8" fill="#1a1a1a" />
                </g>
                <g style={{ 
                  transformOrigin: '17px 16px',
                  animation: 'legsBack 0.25s ease-in-out infinite',
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <path 
                    d="M16 16 L17 20 M18 15 L20 19" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                  {/* Hooves */}
                  <circle cx="17" cy="20.5" r="0.8" fill="#1a1a1a" />
                  <circle cx="20" cy="19.5" r="0.8" fill="#1a1a1a" />
                </g>
              </svg>
            </div>
          ))}
          
          {/* Reins with jingle bells */}
          <div className="relative -ml-2 mr-1">
            <svg width="24" height="14" viewBox="0 0 24 14" className="text-amber-700/60">
              <path d="M0 4 Q12 0 24 6" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M0 8 Q12 12 24 6" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
            
            {/* Sleigh bells on the reins */}
            {[0, 1, 2].map((bellIdx) => (
              <div
                key={bellIdx}
                className="absolute"
                style={{
                  left: `${4 + bellIdx * 8}px`,
                  top: `${bellIdx % 2 === 0 ? 2 : 8}px`,
                  animation: 'sleighBellRing 0.4s ease-in-out infinite',
                  animationDelay: `${bellIdx * 0.13}s`,
                }}
              >
                <svg width="6" height="6" viewBox="0 0 6 6">
                  <circle cx="3" cy="3" r="2.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.3" />
                  <circle cx="2.5" cy="2.5" r="0.8" fill="#fef3c7" />
                  <line x1="3" y1="5" x2="3" y2="6" stroke="#d97706" strokeWidth="0.3" />
                </svg>
              </div>
            ))}
          </div>
          
          {/* Sleigh */}
          <div className="relative">
            <svg 
              width="50" 
              height="32" 
              viewBox="0 0 50 32" 
              className="drop-shadow-[0_0_8px_rgba(255,200,100,0.5)]"
            >
              {/* Sleigh body */}
              <path 
                d="M5 18 Q0 18 2 24 L8 28 Q12 30 20 30 L45 30 Q50 30 48 24 L46 20 Q44 16 38 16 L10 16 Q6 16 5 18 Z" 
                fill="#b91c1c" 
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              <path 
                d="M8 16 Q4 14 6 12 L12 10 L40 10 Q46 10 44 14 L42 16" 
                fill="#dc2626" 
                stroke="#7f1d1d"
                strokeWidth="0.5"
              />
              {/* Gold runner */}
              <path 
                d="M2 28 Q0 30 4 31 L48 31 Q52 30 50 28" 
                stroke="#fbbf24" 
                strokeWidth="2" 
                fill="none"
              />
              
              {/* Gift sack */}
              <ellipse cx="38" cy="14" rx="6" ry="8" fill="#15803d" />
              <path d="M34 8 Q38 4 42 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
              
              {/* Decorative bells on sleigh */}
              <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite' }}>
                <circle cx="6" cy="28" r="2" fill="#fbbf24" />
                <circle cx="5.5" cy="27.5" r="0.6" fill="#fef3c7" />
              </g>
              <g style={{ animation: 'sleighBellRing 0.35s ease-in-out infinite', animationDelay: '0.1s' }}>
                <circle cx="12" cy="29" r="1.5" fill="#fbbf24" />
                <circle cx="11.5" cy="28.5" r="0.5" fill="#fef3c7" />
              </g>
              
              {/* Santa silhouette with waving arm */}
              <g transform="translate(18, 2)">
                {/* Body */}
                <ellipse cx="8" cy="12" rx="6" ry="6" fill="#b91c1c" />
                {/* Face */}
                <circle cx="8" cy="4" r="4" fill="#fcd9b6" />
                {/* Hat */}
                <path d="M4 4 L8 -2 L12 4 Z" fill="#b91c1c" />
                <circle cx="8" cy="-2" r="1.5" fill="white" />
                {/* Beard */}
                <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" />
                {/* Eyes */}
                <circle cx="6.5" cy="3.5" r="0.4" fill="#1a1a1a" />
                <circle cx="9.5" cy="3.5" r="0.4" fill="#1a1a1a" />
                {/* Rosy cheeks */}
                <circle cx="5" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
                <circle cx="11" cy="5" r="0.8" fill="#fca5a5" opacity="0.6" />
                {/* Waving arm */}
                <g style={{ 
                  transformOrigin: '14px 10px',
                  animation: 'santaWave 0.8s ease-in-out infinite',
                }}>
                  <path 
                    d="M14 10 L18 6" 
                    stroke="#b91c1c" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  {/* Mitten */}
                  <circle cx="18" cy="5" r="2" fill="white" />
                </g>
              </g>
            </svg>
            
            {/* Magical sparkle trail */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    right: `${i * 14}px`,
                    top: `${Math.sin(i * 0.8) * 4}px`,
                    opacity: 1 - (i * 0.15),
                    animation: `magicSparkle ${0.6 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  <svg 
                    width={Math.max(4, 10 - i)} 
                    height={Math.max(4, 10 - i)} 
                    viewBox="0 0 24 24" 
                    className="text-yellow-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]"
                  >
                    <path 
                      d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" 
                      fill="currentColor" 
                    />
                  </svg>
                </div>
              ))}
            </div>
            
            {/* Bell sound effect particles */}
            <div className="absolute -bottom-2 left-4 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute text-yellow-400/60 text-xs font-bold"
                  style={{
                    animation: 'bellSoundWave 1.5s ease-out infinite',
                    animationDelay: `${i * 0.5}s`,
                    left: `${i * 8}px`,
                  }}
                >
                  ♪
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
