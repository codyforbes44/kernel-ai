import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { SignInForm } from '../SignInForm';

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/hooks/useHaptic', () => ({
  useHaptic: () => ({ success: vi.fn(), error: vi.fn() }),
}));

vi.mock('@/hooks/useAccountLockout', () => ({
  useAccountLockout: () => ({
    lockoutStatus: null,
    checkLockout: vi.fn().mockResolvedValue({ locked: false, remainingAttempts: 5 }),
    recordAttempt: vi.fn(),
    formatLockoutTime: vi.fn((s) => `${s}s`),
    clearLockoutStatus: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLoginGeolocation', () => ({
  useLoginGeolocation: () => ({
    checkLoginLocation: vi.fn().mockResolvedValue({ isNewLocation: false }),
  }),
}));

vi.mock('@/hooks/useBiometricAuth', () => ({
  useBiometricAuth: () => ({
    isAvailable: false,
    savedCredential: null,
    authenticate: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('SignInForm', () => {
  const mockOnSignIn = vi.fn();
  const mockOnOAuthSignIn = vi.fn();
  const mockOnForgotPassword = vi.fn();
  const mockOnSwitchToSignUp = vi.fn();

  const defaultProps = {
    onSignIn: mockOnSignIn,
    onOAuthSignIn: mockOnOAuthSignIn,
    oauthLoading: null,
    onForgotPassword: mockOnForgotPassword,
    onSwitchToSignUp: mockOnSwitchToSignUp,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in form correctly', () => {
    render(<SignInForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    const user = userEvent.setup();
    render(<SignInForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignInForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls onSignIn with correct data on valid submission', async () => {
    const user = userEvent.setup();
    mockOnSignIn.mockResolvedValueOnce({ error: null, userId: 'user-123' });

    render(<SignInForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith('test@example.com', 'password123', true);
    });
  });

  it('calls onForgotPassword when forgot password is clicked', async () => {
    const user = userEvent.setup();
    render(<SignInForm {...defaultProps} />);

    await user.click(screen.getByText(/forgot password/i));

    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  it('calls onSwitchToSignUp when sign up is clicked', async () => {
    const user = userEvent.setup();
    render(<SignInForm {...defaultProps} />);

    await user.click(screen.getByText(/sign up/i));

    expect(mockOnSwitchToSignUp).toHaveBeenCalled();
  });

  it('displays remember me checkbox', () => {
    render(<SignInForm {...defaultProps} />);

    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('handles sign-in error correctly', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    mockOnSignIn.mockResolvedValueOnce({ error: new Error('Invalid login credentials'), userId: undefined });

    render(<SignInForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
