import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { AuthProvider, useAuth } from '../useAuth';
import React from 'react';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signInWithOAuth: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    upsert: vi.fn(),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.session).toBe(null);
  });

  it('sets loading to false after initial session check', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('signIn calls supabase signInWithPassword', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
      data: { user: { id: 'user-123' }, session: {} }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password123');
      expect(response.error).toBe(null);
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('signIn returns error on failure', async () => {
    const mockError = new Error('Invalid credentials');
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: mockError 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'wrongpassword');
      expect(response.error).toBe(mockError);
    });
  });

  it('signUp calls supabase signUp', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ 
      data: { user: { id: 'user-123' }, session: {} }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'Password123', 'John');
      expect(response.error).toBe(null);
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
      options: {
        data: {
          display_name: 'John',
        },
      },
    });
  });

  it('signUp returns error on failure', async () => {
    const mockError = new Error('User already exists');
    mockSupabase.auth.signUp.mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: mockError 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.signUp('existing@example.com', 'Password123');
      expect(response.error).toBe(mockError);
    });
  });

  it('signOut calls supabase signOut', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('resetPassword calls supabase resetPasswordForEmail', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.resetPassword('test@example.com');
      expect(response.error).toBe(null);
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.any(String),
      })
    );
  });

  it('signInWithOAuth calls supabase signInWithOAuth', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ 
      data: { provider: 'google', url: 'https://...' }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.signInWithOAuth('google');
      expect(response.error).toBe(null);
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.any(String),
      }),
    });
  });
});
