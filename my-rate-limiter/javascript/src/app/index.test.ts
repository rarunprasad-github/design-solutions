import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockReturnValue(Promise.resolve()),
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    zCard: jest.fn(),
    zAdd: jest.fn(),
    zRemRangeByScore: jest.fn(),
  })),
}));

// Import your app after mocking
import app from './index';

describe('Express App', () => {

  // Mock RateLimiter
  jest.mock('../middleware/rateLimiter', () => {
    return jest.fn().mockImplementation(() => ({
      handleRateLimitation: jest.fn((req, res, next: () => void) => {
          console.log('Rate limiter called');
          next();
      }),
    }));
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with "Hello, TypeScript Express!" for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, TypeScript Express!');
  });

  it('should respond with "Hello, Api 1!" for GET /api1', async () => {
    const response = await request(app).get('/api1');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Api 1!');
  });

  it('should respond with "Hello, Api 2!" for GET /api2', async () => {
    const response = await request(app).get('/api2');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Api 2!');
  });

  it('should respond with "Hello, Api 3!" for GET /api3', async () => {
    const response = await request(app).get('/api3');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Api 3!');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });
});
