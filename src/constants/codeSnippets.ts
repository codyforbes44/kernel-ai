// Code snippets for animated code blocks in the hero section
export const CODE_SNIPPETS = [
  { code: 'const app = kernel.init()', lang: 'ts' },
  { code: '<Button variant="primary">', lang: 'jsx' },
  { code: 'await deploy({ env: "prod" })', lang: 'ts' },
  { code: 'function Component() {', lang: 'tsx' },
  { code: 'import { AI } from "@kernel"', lang: 'ts' },
  { code: 'export default App;', lang: 'tsx' },
  { code: 'const theme = useTheme()', lang: 'ts' },
  { code: '<Card className="p-4">', lang: 'jsx' },
] as const;

// Position and depth configurations for code blocks
export const CODE_BLOCK_CONFIGS = [
  { position: { top: '8%', left: '5%' }, zDepth: -40 },
  { position: { top: '15%', left: '75%' }, zDepth: 20 },
  { position: { top: '35%', left: '2%' }, zDepth: -20 },
  { position: { top: '45%', left: '80%' }, zDepth: 35 },
  { position: { top: '65%', left: '8%' }, zDepth: 10 },
  { position: { top: '75%', left: '70%' }, zDepth: -30 },
  { position: { top: '85%', left: '15%' }, zDepth: 25 },
  { position: { top: '25%', left: '85%' }, zDepth: -10 },
] as const;

export type CodeSnippet = typeof CODE_SNIPPETS[number];
export type CodeBlockConfig = typeof CODE_BLOCK_CONFIGS[number];
