interface ReindeerProps {
  index: number;
  isRudolph?: boolean;
}

/**
 * Individual reindeer component with running animation
 */
export function Reindeer({ index, isRudolph = false }: ReindeerProps) {
  return (
    <div
      className="relative"
      style={{
        marginRight: index < 3 ? '-4px' : '0',
        animation: 'reindeerRun 0.5s ease-in-out infinite',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <svg 
        width="28" 
        height="22" 
        viewBox="0 0 28 22" 
        className="text-amber-900/90 drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]"
        aria-hidden="true"
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
          animationDelay: `${index * 0.1}s`,
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
          {isRudolph && (
            <g>
              <circle cx="3" cy="9" r="1.8" fill="#ef4444" />
              <circle cx="2.5" cy="8.5" r="0.5" fill="#fca5a5" />
              {/* Enhanced nose glow */}
              <circle 
                cx="3" cy="9" r="4" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="0.5" 
                opacity="0.4"
                style={{ animation: 'noseGlow 1s ease-in-out infinite' }}
              />
              <circle 
                cx="3" cy="9" r="6" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="0.3" 
                opacity="0.2"
                style={{ animation: 'noseGlow 1s ease-in-out infinite 0.2s' }}
              />
            </g>
          )}
        </g>
        
        {/* Animated running legs */}
        <g style={{ 
          transformOrigin: '10px 16px',
          animation: 'legsFront 0.25s ease-in-out infinite',
          animationDelay: `${index * 0.05}s`,
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
          animationDelay: `${index * 0.05}s`,
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
  );
}
