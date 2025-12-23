/**
 * Test Component for Source Mapper Verification
 * 
 * This component contains various TypeScript patterns to verify that
 * the jsxSourceMapper correctly injects data-lovable-* attributes
 * ONLY into actual JSX elements, NOT into TypeScript generics.
 * 
 * To verify: Inspect elements in browser DevTools
 * - JSX elements SHOULD have data-lovable-id, data-lovable-file, etc.
 * - TypeScript generics should NOT be affected
 */

import React, { useState, useRef, useCallback, useMemo, FC, PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Type definitions (should NOT be affected)
interface TestProps {
  title?: string;
  showAdvanced?: boolean;
}

interface ItemData {
  id: string;
  name: string;
  value: number;
}

type StatusType = 'idle' | 'loading' | 'success' | 'error';

// Generic utility type (should NOT be affected)
type Nullable<T> = T | null;

// Component using React.FC<Props> pattern (Props should NOT get attributes)
const TestSection: React.FC<PropsWithChildren<{ heading: string }>> = ({ heading, children }) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-lg mb-2">{heading}</h3>
      {children}
    </div>
  );
};

// Component using FC<Props> pattern (Props should NOT get attributes)
const StatusBadge: FC<{ status: StatusType }> = ({ status }) => {
  const colors: Record<StatusType, string> = {
    idle: 'bg-gray-500',
    loading: 'bg-yellow-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <Badge className={colors[status]}>
      {status}
    </Badge>
  );
};

// Main test component
export const SourceMapperTest: React.FC<TestProps> = ({ 
  title = "Source Mapper Test", 
  showAdvanced = true 
}) => {
  // useState with generics (generics should NOT get attributes)
  const [count, setCount] = useState<number>(0);
  const [status, setStatus] = useState<StatusType>('idle');
  const [items, setItems] = useState<ItemData[]>([
    { id: '1', name: 'Item 1', value: 100 },
    { id: '2', name: 'Item 2', value: 200 },
  ]);
  const [selected, setSelected] = useState<Nullable<ItemData>>(null);

  // useRef with generics (generics should NOT get attributes)
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // useCallback with generics (generics should NOT get attributes)
  const handleItemClick = useCallback<(item: ItemData) => void>((item) => {
    setSelected(item);
    setStatus('success');
  }, []);

  // useMemo with generics (generics should NOT get attributes)
  const total = useMemo<number>(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const sortedItems = useMemo<ItemData[]>(() => {
    return [...items].sort((a, b) => b.value - a.value);
  }, [items]);

  // Arrow function with generics (should NOT affect generics)
  const findItem = <T extends { id: string }>(arr: T[], id: string): T | undefined => {
    return arr.find(item => item.id === id);
  };

  return (
    <div ref={containerRef} className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Inspect elements in DevTools to verify data-lovable-* attributes
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Basic JSX elements - ALL should have data-lovable attributes */}
          <TestSection heading="Basic Elements">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setCount(c => c + 1)}>
                Count: {count}
              </Button>
              <Button variant="outline" ref={buttonRef}>
                With Ref
              </Button>
              <StatusBadge status={status} />
            </div>
          </TestSection>

          {/* Input with ref - should have attributes */}
          <TestSection heading="Input with Ref">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type something..."
              className="border rounded px-3 py-2 w-full"
            />
          </TestSection>

          {/* List rendering - each item should have attributes */}
          <TestSection heading="List Rendering">
            <ul className="space-y-2">
              {sortedItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 border rounded cursor-pointer hover:bg-muted transition-colors ${
                    selected?.id === item.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-muted-foreground">Value: {item.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm">Total: {total}</p>
          </TestSection>

          {/* Conditional rendering - should have attributes */}
          {showAdvanced && (
            <TestSection heading="Advanced Section">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded">
                  <h4 className="font-semibold">Left Panel</h4>
                  <p>Some content here</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <h4 className="font-semibold">Right Panel</h4>
                  <p>More content here</p>
                </div>
              </div>
            </TestSection>
          )}

          {/* Selected item display */}
          {selected && (
            <TestSection heading="Selected Item">
              <div className="p-4 bg-primary/5 rounded">
                <p><strong>ID:</strong> {selected.id}</p>
                <p><strong>Name:</strong> {selected.name}</p>
                <p><strong>Value:</strong> {selected.value}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSelected(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </TestSection>
          )}

          {/* Nested components with dot notation */}
          <TestSection heading="Component Status">
            <div className="flex items-center gap-4">
              <span>Current Status:</span>
              <StatusBadge status={status} />
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setStatus('idle')}>
                  Idle
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus('loading')}>
                  Loading
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus('success')}>
                  Success
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus('error')}>
                  Error
                </Button>
              </div>
            </div>
          </TestSection>

        </CardContent>
      </Card>

      {/* Footer section */}
      <footer className="text-center text-sm text-muted-foreground">
        <p>
          If this component renders without errors, the source mapper is working correctly.
        </p>
        <p className="mt-1">
          Check DevTools Elements panel to verify data-lovable-* attributes on JSX elements.
        </p>
      </footer>
    </div>
  );
};

export default SourceMapperTest;
