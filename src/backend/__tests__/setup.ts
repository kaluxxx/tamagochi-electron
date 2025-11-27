import { vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@/generated/prisma'

// Create mock Prisma client
export const prismaMock = mockDeep<PrismaClient>()

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Mock the getPrismaClient function
vi.mock('../database/prisma', () => ({
  getPrismaClient: () => prismaMock,
  initializeDatabase: vi.fn().mockResolvedValue(undefined),
  closeDatabase: vi.fn().mockResolvedValue(undefined)
}))

export type PrismaMock = DeepMockProxy<PrismaClient>
