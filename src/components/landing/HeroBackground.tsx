import { Hero3DScene } from '../three/Hero3DScene';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Clean 2100-Era WebGL 3D Scene */}
      <Hero3DScene />
    </div>
  );
}