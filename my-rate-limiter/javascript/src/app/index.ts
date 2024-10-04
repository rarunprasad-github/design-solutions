import express, { NextFunction, Request, Response } from 'express';
import RateLimiter from '../middleware/rateLimiter';
import { HttpError } from '../model/httpError';
import requestLogger from '../middleware/requestLogger';

const app = express();

// Middlewares
app.use(requestLogger.logRequest);
app.use(express.json());

const rateLimiter = new RateLimiter({ timeWindowInSeconds: 1 * 60, maxRequests: 10, rateLimitedAPIs: ['/api1','/api2'] })

app.use(rateLimiter.handleRateLimitation);

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/api1', (_req: Request, res: Response) => {
  res.send('Hello, Api 1!');
});

app.get('/api2', (_req: Request, res: Response) => {
  res.send('Hello, Api 2!');
});

app.get('/api3', (_req: Request, res: Response) => {
  res.send('Hello, Api 3!');
});

// Error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

export default app;