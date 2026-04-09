import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock env
vi.mock('../config/env', () => ({
  default: {
    NASA_API_KEY: 'TEST_KEY',
    JWT_SECRET: 'test-secret-32-chars-minimum-here',
    JWT_REFRESH_SECRET: 'test-refresh-secret-32-chars-here',
    JWT_EXPIRE: '15m',
    JWT_REFRESH_EXPIRE: '7d',
  },
}));

// Mock logger
vi.mock('./logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('JWT Utils', () => {
  let jwtUtils: typeof import('./jwt');

  beforeEach(async () => {
    vi.resetModules();
    jwtUtils = await import('./jwt');
  });

  describe('generateToken', () => {
    it('generates a valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'USER' };
      const token = jwtUtils.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'USER' };
      const token = jwtUtils.generateToken(payload);
      const decoded = jwtUtils.verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    it('returns null for invalid token', () => {
      const decoded = jwtUtils.verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('generates a valid refresh token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'USER' };
      const token = jwtUtils.generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('verifies a valid refresh token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'USER' };
      const token = jwtUtils.generateRefreshToken(payload);
      const decoded = jwtUtils.verifyRefreshToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });
  });

  describe('decodeToken', () => {
    it('decodes a token without verification', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'USER' };
      const token = jwtUtils.generateToken(payload);
      const decoded = jwtUtils.decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });
  });
});
