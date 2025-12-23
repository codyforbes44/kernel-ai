import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '../SignUpForm';

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/hooks/useHaptic', () => ({
  useHaptic: () => ({ success: vi.fn(), error: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SignUpForm', () => {
  const mockOnSignUp = vi.fn();
  const mockOnOAuthSignIn = vi.fn();
  const mockOnSwitchToSignIn = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    onSignUp: mockOnSignUp,
    onOAuthSignIn: mockOnOAuthSignIn,
    oauthLoading: null as null,
    onSwitchToSignIn: mockOnSwitchToSignIn,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-up form correctly', () => {
    render(<SignUpForm {...defaultProps} />);

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'weak');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls onSignUp with correct data on valid submission', async () => {
    const user = userEvent.setup();
    mockOnSignUp.mockResolvedValueOnce({ error: null });

    render(<SignUpForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/display name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnSignUp).toHaveBeenCalledWith('test@example.com', 'Password123', 'John Doe');
    });
  });

  it('calls onSuccess after successful sign up', async () => {
    const user = userEvent.setup();
    mockOnSignUp.mockResolvedValueOnce({ error: null });

    render(<SignUpForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/display name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onSwitchToSignIn when sign in link is clicked', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    await user.click(screen.getByText(/sign in/i));

    expect(mockOnSwitchToSignIn).toHaveBeenCalled();
  });

  it('handles already registered error correctly', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    mockOnSignUp.mockResolvedValueOnce({ error: new Error('User already registered') });

    render(<SignUpForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('This email is already registered. Please sign in instead.');
    });
  });
});
