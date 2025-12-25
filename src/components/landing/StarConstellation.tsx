import { usePerformanceMode } from '@/hooks/useParallaxEffect';
import { Constellation, BackgroundStars } from './constellation';

interface StarConstellationProps {
  scrollY: number;
}

export function StarConstellation({ scrollY }: StarConstellationProps) {
  const { detailLevel, isSmallScreen, isVerySmallScreen, maxGlow } = usePerformanceMode();
  
  const slowParallax = scrollY * 0.3;
  const mediumParallax = scrollY * 0.5;
  const fastParallax = scrollY * 0.7;
  
  // Responsive sizing - reduced for mobile
  const getConstellationSize = (baseWidth: number, baseHeight: number) => {
    if (isVerySmallScreen) return { width: baseWidth * 0.4, height: baseHeight * 0.4 };
    if (isSmallScreen) return { width: baseWidth * 0.6, height: baseHeight * 0.6 };
    return { width: baseWidth, height: baseHeight };
  };
  
  const creationSize = getConstellationSize(150, 190);
  const developmentSize = getConstellationSize(210, 110);
  const intelligenceSize = getConstellationSize(190, 90);
  
  // Background star count based on screen size
  const bgStarCount = isVerySmallScreen ? 20 : isSmallScreen ? 35 : 60;

  return (
    <>
      {/* Background star field with Kernel colors */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          transform: `translateY(${slowParallax * 0.3}px)`,
        }}
      >
        <BackgroundStars count={bgStarCount} maxGlow={maxGlow} />
      </div>

      {/* Intelligence constellation - top right (AI & Automation) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: isSmallScreen ? '2%' : '8%',
          top: isSmallScreen ? '8%' : '12%',
          transform: `translateY(${slowParallax * 0.4}px)`,
          opacity: 0.85,
        }}
      >
        <Constellation
          name="intelligence"
          width={intelligenceSize.width}
          height={intelligenceSize.height}
          detailLevel={detailLevel}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Development constellation - top left (Code & Deploy) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: isSmallScreen ? '3%' : '5%',
          top: isSmallScreen ? '15%' : '20%',
          transform: `translateY(${mediumParallax * 0.3}px)`,
          opacity: 0.75,
        }}
      >
        <Constellation
          name="development"
          width={developmentSize.width}
          height={developmentSize.height}
          detailLevel={detailLevel}
          showLabels={!isSmallScreen}
        />
      </div>

      {/* Creation constellation - center bottom (Build & Create) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: isSmallScreen ? '15%' : '25%',
          bottom: isSmallScreen ? '20%' : '15%',
          transform: `translateY(${fastParallax * 0.2}px)`,
          opacity: 0.9,
        }}
      >
        <Constellation
          name="creation"
          width={creationSize.width}
          height={creationSize.height}
          detailLevel={detailLevel}
          showLabels={!isSmallScreen}
        />
      </div>
    </>
  );
}
