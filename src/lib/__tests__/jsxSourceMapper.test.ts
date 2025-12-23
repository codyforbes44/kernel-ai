import { describe, it, expect, beforeEach } from 'vitest';
import { 
  injectSourceMapping, 
  resetSourceMappingCounters,
  parseSourceMapping,
  formatSourceLocation 
} from '../jsxSourceMapper';

describe('jsxSourceMapper', () => {
  beforeEach(() => {
    resetSourceMappingCounters();
  });

  describe('injectSourceMapping', () => {
    describe('TypeScript generics handling', () => {
      it('should NOT inject into React.FC<Props> type annotations', () => {
        const input = `const Button: React.FC<ButtonProps> = ({ children }) => {
  return <button>{children}</button>;
};`;
        const result = injectSourceMapping(input, 'Button.tsx');
        
        // Should NOT have data-lovable attributes in the type annotation
        expect(result).not.toContain('React.FC<ButtonProps data-lovable');
        expect(result).not.toContain('<ButtonProps data-lovable');
        
        // Should have data-lovable on the actual JSX button element
        expect(result).toContain('<button data-lovable');
      });

      it('should NOT inject into FC<Props> type annotations', () => {
        const input = `const Card: FC<CardProps> = ({ title }) => {
  return <div>{title}</div>;
};`;
        const result = injectSourceMapping(input, 'Card.tsx');
        
        expect(result).not.toContain('FC<CardProps data-lovable');
        expect(result).not.toContain('<CardProps data-lovable');
        expect(result).toContain('<div data-lovable');
      });

      it('should NOT inject into FunctionComponent<Props> type annotations', () => {
        const input = `const Modal: FunctionComponent<ModalProps> = ({ isOpen }) => {
  return <dialog>{isOpen && 'Open'}</dialog>;
};`;
        const result = injectSourceMapping(input, 'Modal.tsx');
        
        expect(result).not.toContain('<ModalProps data-lovable');
        expect(result).toContain('<dialog data-lovable');
      });

      it('should NOT inject into useState<T> generics', () => {
        const input = `const [count, setCount] = useState<number>(0);
const [items, setItems] = useState<Item[]>([]);`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('useState<number data-lovable');
        expect(result).not.toContain('<number data-lovable');
        expect(result).not.toContain('<Item data-lovable');
      });

      it('should NOT inject into useRef<T> generics', () => {
        const input = `const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement | null>(null);`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('<HTMLInputElement data-lovable');
        expect(result).not.toContain('<HTMLDivElement data-lovable');
      });

      it('should NOT inject into nested generics', () => {
        const input = `const data = useQuery<Response<User>>();
type Wrapper = Map<string, Set<number>>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('<Response data-lovable');
        expect(result).not.toContain('<User data-lovable');
        expect(result).not.toContain('<Set data-lovable');
      });

      it('should NOT inject into PropsWithChildren<Props>', () => {
        const input = `const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({ children }) => {
  return <main>{children}</main>;
};`;
        const result = injectSourceMapping(input, 'Layout.tsx');
        
        expect(result).not.toContain('<PropsWithChildren data-lovable');
        expect(result).not.toContain('<LayoutProps data-lovable');
        expect(result).toContain('<main data-lovable');
      });

      it('should NOT inject into ComponentType<Props>', () => {
        const input = `const withAuth = <P extends object>(Component: ComponentType<P>) => {
  return <Component {...props} />;
};`;
        const result = injectSourceMapping(input, 'withAuth.tsx');
        
        expect(result).not.toContain('ComponentType<P data-lovable');
        expect(result).not.toContain('<P data-lovable');
      });
    });

    describe('Props/Type/State pattern skipping', () => {
      it('should skip tag names ending in Props', () => {
        const input = `type Test = <ButtonProps>`;
        const result = injectSourceMapping(input, 'Test.tsx');
        
        expect(result).not.toContain('<ButtonProps data-lovable');
      });

      it('should skip tag names ending in Type', () => {
        const input = `const x: DataType = {};`;
        const result = injectSourceMapping(input, 'Test.tsx');
        
        expect(result).not.toContain('<DataType data-lovable');
      });

      it('should skip tag names ending in State', () => {
        const input = `const [state, setState] = useState<FormState>(initial);`;
        const result = injectSourceMapping(input, 'Test.tsx');
        
        expect(result).not.toContain('<FormState data-lovable');
      });
    });

    describe('actual JSX injection', () => {
      it('should inject into basic HTML elements', () => {
        const input = `return <div className="container">Hello</div>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).toContain('<div data-lovable-id=');
        expect(result).toContain('data-lovable-file="Component.tsx"');
      });

      it('should inject into self-closing elements', () => {
        const input = `return <input type="text" />;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).toContain('<input data-lovable-id=');
      });

      it('should inject into custom React components', () => {
        const input = `return <MyButton onClick={handleClick}>Click me</MyButton>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).toContain('<MyButton data-lovable-id=');
      });

      it('should inject into nested JSX elements', () => {
        const input = `return (
  <div>
    <span>Text</span>
    <button>Click</button>
  </div>
);`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).toContain('<div data-lovable-id=');
        expect(result).toContain('<span data-lovable-id=');
        expect(result).toContain('<button data-lovable-id=');
      });

      it('should inject into components with dot notation', () => {
        const input = `return <Card.Header>Title</Card.Header>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).toContain('<Card.Header data-lovable-id=');
      });
    });

    describe('skip patterns', () => {
      it('should NOT process import statements', () => {
        const input = `import { Button } from './Button';`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('data-lovable');
      });

      it('should NOT process comments', () => {
        const input = `// This is a <Component> comment`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('data-lovable');
      });

      it('should NOT process type definitions', () => {
        const input = `type Props = { value: string };
interface Config { enabled: boolean };`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('data-lovable');
      });

      it('should NOT inject into strings', () => {
        const input = `const text = "Click <Button> here";
const template = \`Use <Component />\`;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        expect(result).not.toContain('data-lovable');
      });

      it('should NOT process non-JSX files', () => {
        const input = `const x = <T>(value: T) => value;`;
        const result = injectSourceMapping(input, 'utils.ts');
        
        expect(result).toBe(input);
      });

      it('should skip React internal components', () => {
        const input = `return <Suspense fallback={<Loading />}><App /></Suspense>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        // Suspense should be skipped
        expect(result).not.toContain('<Suspense data-lovable');
        // But Loading and App should have attributes
        expect(result).toContain('<Loading data-lovable');
        expect(result).toContain('<App data-lovable');
      });
    });

    describe('edge cases', () => {
      it('should handle elements that already have data-lovable-id', () => {
        const input = `return <div data-lovable-id="existing">Content</div>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        // Should not add duplicate attributes
        expect(result.match(/data-lovable-id/g)?.length).toBe(1);
      });

      it('should handle complex mixed content', () => {
        const input = `const Component: React.FC<Props> = () => {
  const [data, setData] = useState<Data[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={ref}>
      <header>Header</header>
      <main>
        {data.map(item => <Item key={item.id} />)}
      </main>
    </div>
  );
};`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        // Should NOT inject into generics
        expect(result).not.toContain('<Props data-lovable');
        expect(result).not.toContain('<Data data-lovable');
        expect(result).not.toContain('<HTMLDivElement data-lovable');
        
        // Should inject into JSX
        expect(result).toContain('<div data-lovable');
        expect(result).toContain('<header data-lovable');
        expect(result).toContain('<main data-lovable');
        expect(result).toContain('<Item data-lovable');
      });

      it('should handle arrow function generics', () => {
        const input = `const identity = <T extends object>(value: T): T => value;
const Component = <P,>(props: P) => <div>{JSON.stringify(props)}</div>;`;
        const result = injectSourceMapping(input, 'Component.tsx');
        
        // Should not inject into generic type parameters
        expect(result).not.toContain('<T data-lovable');
        expect(result).not.toContain('<P data-lovable');
        // Should inject into actual JSX
        expect(result).toContain('<div data-lovable');
      });
    });
  });

  describe('parseSourceMapping', () => {
    it('should parse valid source mapping from element dataset', () => {
      const mockElement = {
        dataset: {
          lovableId: 'test_id',
          lovableFile: 'Component.tsx',
          lovableLine: '10',
          lovableCol: '5',
        },
      } as unknown as HTMLElement;

      const result = parseSourceMapping(mockElement);

      expect(result).toEqual({
        elementId: 'test_id',
        filePath: 'Component.tsx',
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    it('should return null for missing required attributes', () => {
      const mockElement = {
        dataset: {},
      } as unknown as HTMLElement;

      const result = parseSourceMapping(mockElement);

      expect(result).toBeNull();
    });
  });

  describe('formatSourceLocation', () => {
    it('should format source location correctly', () => {
      const mapping = {
        elementId: 'test',
        filePath: 'src/Component.tsx',
        lineNumber: 42,
        columnNumber: 10,
      };

      const result = formatSourceLocation(mapping);

      expect(result).toBe('src/Component.tsx:42:10');
    });
  });
});
