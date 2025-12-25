/**
 * Type guard utilities for runtime type checking
 */

type PropertyCheck = string | { key: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array' };

/**
 * Creates a type guard function that checks if an unknown value matches
 * the expected shape based on required property keys.
 * 
 * @example
 * // Simple usage with just key names
 * const isUser = createTypeGuard<User>(['id', 'email', 'name']);
 * 
 * @example
 * // With type checking for specific properties
 * const isUser = createTypeGuard<User>([
 *   { key: 'id', type: 'string' },
 *   { key: 'age', type: 'number' },
 *   'name' // just checks existence
 * ]);
 * 
 * @example
 * // Usage
 * if (isUser(data)) {
 *   console.log(data.email); // TypeScript knows data is User
 * }
 */
export function createTypeGuard<T>(
  requiredProperties: PropertyCheck[]
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    for (const prop of requiredProperties) {
      if (typeof prop === 'string') {
        // Simple key existence check
        if (!(prop in value)) {
          return false;
        }
      } else {
        // Key with type check
        if (!(prop.key in value)) {
          return false;
        }
        
        const val = (value as Record<string, unknown>)[prop.key];
        
        switch (prop.type) {
          case 'string':
            if (typeof val !== 'string') return false;
            break;
          case 'number':
            if (typeof val !== 'number') return false;
            break;
          case 'boolean':
            if (typeof val !== 'boolean') return false;
            break;
          case 'object':
            if (typeof val !== 'object' || val === null) return false;
            break;
          case 'array':
            if (!Array.isArray(val)) return false;
            break;
        }
      }
    }

    return true;
  };
}

/**
 * Creates a type guard for arrays of a specific type
 * 
 * @example
 * const isUser = createTypeGuard<User>(['id', 'email']);
 * const isUserArray = createArrayTypeGuard(isUser);
 * 
 * if (isUserArray(data)) {
 *   data.forEach(user => console.log(user.email));
 * }
 */
export function createArrayTypeGuard<T>(
  itemGuard: (value: unknown) => value is T
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => {
    return Array.isArray(value) && value.every(itemGuard);
  };
}

/**
 * Creates a type guard that allows null values
 * 
 * @example
 * const isUser = createTypeGuard<User>(['id', 'email']);
 * const isNullableUser = createNullableTypeGuard(isUser);
 */
export function createNullableTypeGuard<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T | null {
  return (value: unknown): value is T | null => {
    return value === null || guard(value);
  };
}

/**
 * Asserts that a value matches a type guard, throwing if it doesn't
 * 
 * @example
 * const isUser = createTypeGuard<User>(['id', 'email']);
 * assertType(data, isUser, 'Expected User object');
 * // data is now typed as User
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message = 'Type assertion failed'
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(message);
  }
}

/**
 * Safely narrows a value with a type guard, returning undefined if check fails
 * 
 * @example
 * const user = narrowType(data, isUser);
 * // user is User | undefined
 */
export function narrowType<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): T | undefined {
  return guard(value) ? value : undefined;
}
