import RateLimiter from './rateLimiter';
import { TooManyRequestsError } from '../model/httpError';
import redisClient from '../redis/redisClient';
import { Request, Response } from 'express';

jest.mock('../redis/redisClient', () => ({
  zRemRangeByScore: jest.fn(),
  zCard: jest.fn(),
  zAdd: jest.fn(),
  expire: jest.fn(),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const mockConfig = {
    timeWindowInSeconds: 60,
    maxRequests: 10,
    rateLimitedAPIs: ['/api1', '/api2'],
  };

  beforeEach(() => {
    rateLimiter = new RateLimiter(mockConfig);
    jest.clearAllMocks();
  });

  test('isRateLimitedAPI returns correct boolean', () => {
    expect(rateLimiter.isRateLimitedAPI('/api1')).toBe(true);
    expect(rateLimiter.isRateLimitedAPI('/api3')).toBe(false);
  });

  test('refreshRateLimitData calls zRemRangeByScore', async () => {
    const key = '/api1';
    const currentTime = Date.now();
    await rateLimiter.refreshRateLimitData(key, currentTime);
    expect(redisClient.zRemRangeByScore).toHaveBeenCalledWith(key, 0, currentTime - 60000);
  });

  test('isRequestAllowed returns true when under limit', async () => {
    (redisClient.zCard as jest.Mock).mockResolvedValue(5);
    (redisClient.zAdd as jest.Mock).mockResolvedValue(1);
    const result = await rateLimiter.isRequestAllowed('/api1', Date.now());
    expect(result).toBe(true);
  });

  test('isRequestAllowed returns false when over limit', async () => {
    (redisClient.zCard as jest.Mock).mockResolvedValue(10);
    const result = await rateLimiter.isRequestAllowed('/api1', Date.now());
    expect(result).toBe(false);
  });

  test('handleRateLimitation calls next for non-rate-limited API', async () => {
    const req = { path: '/api3' } as Request;
    const res = {} as Response;
    const next = jest.fn();
    await rateLimiter.handleRateLimitation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('handleRateLimitation calls next with TooManyRequestsError when rate limited', async () => {
    const req = { path: '/api1' } as Request;
    const res = {} as Response;
    const next = jest.fn();
    jest.spyOn(rateLimiter, 'isRequestAllowed').mockResolvedValue(false);
    await rateLimiter.handleRateLimitation(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(TooManyRequestsError));
  });
});