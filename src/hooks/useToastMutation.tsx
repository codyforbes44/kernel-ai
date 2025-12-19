import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ToastMutationOptions<TData, TError, TVariables, TContext> 
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: TError) => string);
  loadingMessage?: string;
}

/**
 * A wrapper around useMutation that automatically handles toast notifications
 * for success, error, and optionally loading states.
 */
export function useToastMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>({
  successMessage,
  errorMessage = 'An error occurred',
  loadingMessage,
  onSuccess,
  onError,
  ...options
}: ToastMutationOptions<TData, TError, TVariables, TContext>) {
  return useMutation({
    ...options,
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        const message = typeof successMessage === 'function' 
          ? successMessage(data) 
          : successMessage;
        toast.success(message);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message = typeof errorMessage === 'function'
        ? errorMessage(error)
        : errorMessage;
      toast.error(message);
      onError?.(error, variables, context);
    },
  });
}
