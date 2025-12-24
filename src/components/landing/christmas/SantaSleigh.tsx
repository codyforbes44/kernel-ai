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
      }}
    >
      <div 
        className="relative"
        style={{ animation: 'sleighBob 2s ease-in-out infinite' }}
      >
        {/* Reindeer team - 4 reindeer */}
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
                height="20" 
                viewBox="0 0 28 20" 
                className="text-amber-900/90 drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]"
              >
                <ellipse cx="14" cy="12" rx="8" ry="5" fill="currentColor" />
                <circle cx="6" cy="9" r="3.5" fill="currentColor" />
                <path 
                  d="M7 6 L8 2 L10 4 M5 6 L4 2 L2 4 M8 3 L9 1 M4 3 L3 1" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  fill="none"
                />
                <path 
                  d="M10 15 L8 19 M12 16 L11 19 M16 16 L17 19 M18 15 L20 19" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                {i === 0 && (
                  <circle cx="3" cy="9" r="1.5" fill="#ef4444" className="animate-pulse" />
                )}
              </svg>
            </div>
          ))}
          
          {/* Reins */}
          <svg width="20" height="10" viewBox="0 0 20 10" className="text-amber-700/60 -ml-2 mr-1">
            <path d="M0 3 Q10 0 20 5" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M0 7 Q10 10 20 5" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          
          {/* Sleigh */}
          <div className="relative">
            <svg 
              width="50" 
              height="32" 
              viewBox="0 0 50 32" 
              className="drop-shadow-[0_0_8px_rgba(255,200,100,0.5)]"
            >
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
              <path 
                d="M2 28 Q0 30 4 31 L48 31 Q52 30 50 28" 
                stroke="#fbbf24" 
                strokeWidth="2" 
                fill="none"
              />
              <ellipse cx="38" cy="14" rx="6" ry="8" fill="#15803d" />
              <path d="M34 8 Q38 4 42 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
              
              {/* Santa silhouette */}
              <g transform="translate(18, 2)">
                <ellipse cx="8" cy="12" rx="6" ry="6" fill="#b91c1c" />
                <circle cx="8" cy="4" r="4" fill="#fcd9b6" />
                <path d="M4 4 L8 -2 L12 4 Z" fill="#b91c1c" />
                <circle cx="8" cy="-2" r="1.5" fill="white" />
                <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" />
                <path 
                  d="M14 10 L18 6" 
                  stroke="#b91c1c" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{ animation: 'santaWave 0.8s ease-in-out infinite' }}
                />
                <circle cx="18" cy="5" r="2" fill="#fcd9b6" />
              </g>
            </svg>
            
            {/* Sparkle trail - reduced count */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    right: `${i * 14}px`,
                    opacity: 1 - (i * 0.15),
                    animation: `twinkle ${0.6 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
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
          </div>
        </div>
      </div>
    </div>
  );
}
