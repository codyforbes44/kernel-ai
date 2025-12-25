import { useEffect, useRef } from 'react';

interface Particle3D {
  x: number;
  y: number;
  z: number; // Depth from -100 (far) to +50 (near)
  vx: number;
  vy: number;
  vz: number;
  baseSize: number;
  baseOpacity: number;
  isWarpStreak?: boolean;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 3D particles with depth distribution
    const particleCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      // Most particles are distant, fewer are close
      const depthBias = Math.random();
      const z = depthBias < 0.6 
        ? -100 + Math.random() * 60  // Far particles (60%)
        : depthBias < 0.9 
          ? -40 + Math.random() * 60  // Mid particles (30%)
          : 20 + Math.random() * 30;  // Near particles (10%)
      
      // Occasional warp streak particle
      const isWarpStreak = i < 3;
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: isWarpStreak ? 0.8 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.05,
        baseSize: Math.random() * 2.5 + 1,
        baseOpacity: Math.random() * 0.4 + 0.2,
        isWarpStreak,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Depth-based calculations
    const getDepthScale = (z: number): number => {
      // z ranges from -100 (far) to +50 (near)
      // Scale from 0.3 (far) to 1.5 (near)
      return 0.3 + ((z + 100) / 150) * 1.2;
    };

    const getDepthOpacity = (z: number): number => {
      // Far particles are more faded (fog effect)
      return 0.2 + ((z + 100) / 150) * 0.8;
    };

    const getDepthSpeed = (z: number): number => {
      // Near particles move faster
      return 0.5 + ((z + 100) / 150) * 1.5;
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        const depthScale = getDepthScale(particle.z);
        const depthOpacity = getDepthOpacity(particle.z);
        const depthSpeed = getDepthSpeed(particle.z);
        
        // Update position with depth-based speed
        particle.x += particle.vx * depthSpeed;
        particle.y += particle.vy * depthSpeed;
        particle.z += particle.vz;

        // Warp streak reset
        if (particle.isWarpStreak) {
          if (particle.z > 50) {
            particle.z = -100;
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
          }
        } else {
          // Regular particle z oscillation
          if (particle.z > 50 || particle.z < -100) {
            particle.vz *= -1;
          }
        }

        // Enhanced mouse influence for near particles
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = particle.z > 0 ? 0.02 : 0.008;
        
        if (dist < 200) {
          const force = (200 - dist) / 200 * mouseInfluence;
          particle.vx += dx * force;
          particle.vy += dy * force;
        }

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const size = particle.baseSize * depthScale;
        const opacity = particle.baseOpacity * depthOpacity;

        // Draw warp streak with trail
        if (particle.isWarpStreak && particle.z > -50) {
          const trailLength = 20 * depthScale;
          const gradient = ctx.createLinearGradient(
            particle.x, particle.y,
            particle.x, particle.y - trailLength
          );
          gradient.addColorStop(0, `rgba(0, 217, 255, ${opacity})`);
          gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x, particle.y - trailLength);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = size * 0.5;
          ctx.stroke();
        }

        // Draw particle with depth-based blur simulation (larger glow for distant)
        const blurMultiplier = particle.z < -50 ? 2 : 1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${opacity * 0.9})`;
        ctx.fill();
        
        // Glow halo - larger for distant particles (atmospheric scattering effect)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2.5 * blurMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${opacity * 0.08})`;
        ctx.fill();
      });

      // Draw connections only between particles at similar depths
      particlesRef.current.forEach((p1, i) => {
        if (p1.isWarpStreak) return;
        
        particlesRef.current.slice(i + 1).forEach((p2) => {
          if (p2.isWarpStreak) return;
          
          // Only connect particles within 30 units of Z depth
          const zDiff = Math.abs(p1.z - p2.z);
          if (zDiff > 30) return;
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connection distance varies with depth
          const avgZ = (p1.z + p2.z) / 2;
          const maxDist = 100 + (avgZ + 100) * 0.5;
          
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            const avgDepthOpacity = getDepthOpacity(avgZ);
            const lineOpacity = (1 - dist / maxDist) * 0.2 * avgDepthOpacity;
            
            ctx.strokeStyle = `rgba(0, 217, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
