import { useEffect, useState } from 'react';

const codeSnippets = [
  { code: 'const app = kernel.init()', lang: 'ts' },
  { code: '<Button variant="primary">', lang: 'jsx' },
  { code: 'await deploy({ env: "prod" })', lang: 'ts' },
  { code: 'function Component() {', lang: 'tsx' },
  { code: 'import { AI } from "@kernel"', lang: 'ts' },
  { code: 'export default App;', lang: 'tsx' },
  { code: 'const theme = useTheme()', lang: 'ts' },
  { code: '<Card className="p-4">', lang: 'jsx' },
];

interface CodeBlockProps {
  snippet: { code: string; lang: string };
  position: { top: string; left: string };
  delay: number;
  duration: number;
}

function CodeBlock({ snippet, position, delay, duration }: CodeBlockProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => setVisible(true), delay * 1000);
    const hideTimeout = setTimeout(() => setVisible(false), (delay + duration) * 1000);
    
    const interval = setInterval(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), duration * 1000);
    }, (delay + duration + 2) * 1000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, [delay, duration]);

  return (
    <div
      className={`absolute font-mono text-xs px-3 py-1.5 rounded-md border transition-all duration-700
        ${visible ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{
        top: position.top,
        left: position.left,
        background: 'hsl(var(--card) / 0.6)',
        borderColor: 'hsl(var(--primary) / 0.2)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="text-primary/60">{snippet.code}</span>
    </div>
  );
}

export function AnimatedCodeBlocks() {
  const positions = [
    { top: '8%', left: '5%' },
    { top: '15%', left: '75%' },
    { top: '35%', left: '2%' },
    { top: '45%', left: '80%' },
    { top: '65%', left: '8%' },
    { top: '75%', left: '70%' },
    { top: '85%', left: '15%' },
    { top: '25%', left: '85%' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeSnippets.map((snippet, index) => (
        <CodeBlock
          key={index}
          snippet={snippet}
          position={positions[index]}
          delay={index * 1.5}
          duration={4}
        />
      ))}
    </div>
  );
}
