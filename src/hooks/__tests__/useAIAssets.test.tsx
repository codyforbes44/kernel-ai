import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAIAssets, GeneratedAsset } from '../useAIAssets';
import React from 'react';

// Mock auth hook
vi.mock('../useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    }),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: mockAssets, error: null }),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
    update: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      remove: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock fetch for edge functions
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAssets: GeneratedAsset[] = [
  {
    id: 'asset-1',
    user_id: 'user-123',
    project_id: 'project-1',
    prompt: 'A beautiful sunset',
    style: 'realistic',
    aspect_ratio: '16:9',
    asset_type: 'image',
    storage_path: 'assets/image-1.png',
    storage_url: 'https://example.com/image-1.png',
    thumbnail_url: null,
    width: 1920,
    height: 1080,
    file_size: 1024000,
    mime_type: 'image/png',
    tags: ['sunset', 'nature'],
    is_favorite: false,
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asset-2',
    user_id: 'user-123',
    project_id: 'project-1',
    prompt: 'An abstract pattern',
    style: 'abstract',
    aspect_ratio: '1:1',
    asset_type: 'image',
    storage_path: 'assets/image-2.png',
    storage_url: 'https://example.com/image-2.png',
    thumbnail_url: null,
    width: 1024,
    height: 1024,
    file_size: 512000,
    mime_type: 'image/png',
    tags: ['abstract'],
    is_favorite: true,
    metadata: {},
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAIAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAIAssets('project-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoadingAssets).toBe(true);
    expect(result.current.generatingImage).toBe(false);
    expect(result.current.convertingScreenshot).toBe(false);
  });

  it('copyImageUrl copies URL to clipboard', async () => {
    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    const { toast } = await import('sonner');

    await act(async () => {
      await result.current.copyImageUrl('https://example.com/image.png');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/image.png');
    expect(toast.success).toHaveBeenCalledWith('URL copied to clipboard');
  });

  it('getImageCodeSnippet generates correct JSX snippet', async () => {
    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoadingAssets).toBe(false);
    });

    const snippet = result.current.getImageCodeSnippet(mockAssets[0], 'jsx');
    expect(snippet).toContain('<img src=');
    expect(snippet).toContain('alt="A beautiful sunset"');
    expect(snippet).toContain('className="w-full h-auto"');
  });

  it('getImageCodeSnippet generates correct img snippet', async () => {
    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    const snippet = result.current.getImageCodeSnippet(mockAssets[0], 'img');
    expect(snippet).toContain('<img src=');
    expect(snippet).not.toContain('className');
  });

  it('getImageCodeSnippet generates correct background snippet', async () => {
    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    const snippet = result.current.getImageCodeSnippet(mockAssets[0], 'bg');
    expect(snippet).toContain('backgroundImage');
    expect(snippet).toContain('url(');
  });

  it('generateImage calls edge function', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ asset: mockAssets[0] }),
    });

    const { result } = renderHook(() => useAIAssets('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoadingAssets).toBe(false);
    });

    await act(async () => {
      await result.current.generateImage({
        prompt: 'A beautiful sunset',
        style: 'realistic',
        aspectRatio: '16:9',
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/generate-image'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('screenshotToCode calls edge function', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        code: '<div>Component</div>', 
        componentName: 'MyComponent' 
      }),
    });

    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoadingAssets).toBe(false);
    });

    let response;
    await act(async () => {
      response = await result.current.screenshotToCode({
        imageBase64: 'base64data',
        description: 'A button component',
      });
    });

    expect(response).toEqual({
      code: '<div>Component</div>',
      componentName: 'MyComponent',
    });
  });

  it('handles generateImage error correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Generation failed' }),
    });

    const { result } = renderHook(() => useAIAssets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoadingAssets).toBe(false);
    });

    const { toast } = await import('sonner');

    await act(async () => {
      try {
        await result.current.generateImage({ prompt: 'test' });
      } catch {
        // Expected to throw
      }
    });

    expect(toast.error).toHaveBeenCalled();
  });
});
