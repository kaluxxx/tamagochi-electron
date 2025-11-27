/**
 * Custom error classes for the backend
 * Provides typed errors for different failure scenarios
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    const message = id ? `${entity} with id '${id}' not found` : `${entity} not found`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class InsufficientFundsError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient funds: required ${required}, available ${available}`,
      'INSUFFICIENT_FUNDS',
      400
    )
    this.name = 'InsufficientFundsError'
  }
}

export class InsufficientQuantityError extends AppError {
  constructor(item: string, required: number, available: number) {
    super(
      `Insufficient ${item}: required ${required}, available ${available}`,
      'INSUFFICIENT_QUANTITY',
      400
    )
    this.name = 'InsufficientQuantityError'
  }
}

export class AlreadyOwnedError extends AppError {
  constructor(item: string) {
    super(`${item} is already owned`, 'ALREADY_OWNED', 400)
    this.name = 'AlreadyOwnedError'
  }
}

export class AlreadyUnlockedError extends AppError {
  constructor(item: string) {
    super(`${item} is already unlocked`, 'ALREADY_UNLOCKED', 400)
    this.name = 'AlreadyUnlockedError'
  }
}

export class AnimalDeadError extends AppError {
  constructor(animalId: string) {
    super(`Animal '${animalId}' is dead and cannot perform actions`, 'ANIMAL_DEAD', 400)
    this.name = 'AnimalDeadError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500)
    this.name = 'DatabaseError'
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Serializes an error for IPC response
 */
export function serializeError(error: unknown): {
  success: false
  error: {
    name: string
    message: string
    code: string
    details?: Record<string, string[]>
  }
} {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        details: error instanceof ValidationError ? error.details : undefined
      }
    }
  }

  // Unknown error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return {
    success: false,
    error: {
      name: 'UnknownError',
      message,
      code: 'UNKNOWN_ERROR'
    }
  }
}
