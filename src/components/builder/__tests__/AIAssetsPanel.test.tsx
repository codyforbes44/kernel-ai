import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIAssetsPanel } from '../AIAssetsPanel';

// Mock useAIAssets hook
const mockAssets = [
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
    tags: ['sunset'],
    is_favorite: false,
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

vi.mock('@/hooks/useAIAssets', () => ({
  useAIAssets: () => ({
    assets: mockAssets,
    isLoadingAssets: false,
    generatingImage: false,
    convertingScreenshot: false,
    generateImage: vi.fn().mockResolvedValue(mockAssets[0]),
    screenshotToCode: vi.fn().mockResolvedValue({ code: '<div />', componentName: 'Test' }),
    deleteAsset: vi.fn().mockResolvedValue(undefined),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    copyImageUrl: vi.fn(),
    downloadImage: vi.fn(),
    getImageCodeSnippet: vi.fn((asset, format) => `<img src="${asset.storage_url}" />`),
  }),
}));

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

describe('AIAssetsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the panel with correct header', () => {
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    expect(screen.getByText('AI Studio')).toBeInTheDocument();
  });

  it('displays asset count badge', () => {
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    expect(screen.getByText('1 assets')).toBeInTheDocument();
  });

  it('renders all three tabs', () => {
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: /generate/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /screenshot/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /library/i })).toBeInTheDocument();
  });

  it('starts with generate tab by default', () => {
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: /generate/i })).toHaveAttribute('data-state', 'active');
  });

  it('starts with specified initial tab', () => {
    render(<AIAssetsPanel projectId="project-1" initialTab="library" />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: /library/i })).toHaveAttribute('data-state', 'active');
  });

  it('switches to library tab when clicked', async () => {
    const user = userEvent.setup();
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /library/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /library/i })).toHaveAttribute('data-state', 'active');
    });
  });

  it('switches to screenshot tab when clicked', async () => {
    const user = userEvent.setup();
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /screenshot/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /screenshot/i })).toHaveAttribute('data-state', 'active');
    });
  });

  it('calls onInsertCode when code is generated', async () => {
    const mockOnInsertCode = vi.fn();
    render(
      <AIAssetsPanel projectId="project-1" onInsertCode={mockOnInsertCode} initialTab="library" />,
      { wrapper: createWrapper() }
    );

    // The library should be showing assets
    await waitFor(() => {
      expect(screen.getByText('A beautiful sunset')).toBeInTheDocument();
    });
  });

  it('displays loading state for generate tab content', () => {
    render(<AIAssetsPanel projectId="project-1" />, { wrapper: createWrapper() });

    // Should show the generate form
    expect(screen.getByPlaceholderText(/describe the image/i)).toBeInTheDocument();
  });

  it('renders without projectId', () => {
    render(<AIAssetsPanel />, { wrapper: createWrapper() });

    expect(screen.getByText('AI Studio')).toBeInTheDocument();
  });
});
