import { ReactNode, ComponentType, createElement, ReactElement } from 'react';

interface ProviderConfig<P = Record<string, unknown>> {
  provider: ComponentType<P & { children: ReactNode }>;
  props?: Omit<P, 'children'>;
}

/**
 * Composes multiple React context providers into a single wrapper.
 * Reduces nesting and improves readability in App.tsx.
 * 
 * @example
 * const providers = [
 *   { provider: ThemeProvider, props: { defaultTheme: 'dark' } },
 *   { provider: AuthProvider },
 *   { provider: QueryClientProvider, props: { client: queryClient } },
 * ];
 * 
 * <ProviderComposer providers={providers}>
 *   <App />
 * </ProviderComposer>
 */
export function ProviderComposer({
  providers,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers: ProviderConfig<any>[];
  children: ReactNode;
}): ReactElement {
  return providers.reduceRight<ReactElement>(
    (acc, { provider, props = {} }) => 
      createElement(provider, { ...props, children: acc }),
    children as ReactElement
  );
}

export type { ProviderConfig };
