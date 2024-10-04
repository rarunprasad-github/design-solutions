import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../model/httpError';
import redisClient from '../redis/redisClient';

interface RateLimiterConfig {
  timeWindowInSeconds: number,
  maxRequests: number,
  rateLimitedAPIs: string[]
}

class RateLimiter {

  timeWindowInSeconds;
  maxRequests;
  rateLimitedAPIs;

  constructor (config: RateLimiterConfig) {
    this.timeWindowInSeconds = config.timeWindowInSeconds;
    this.maxRequests = config.maxRequests;
    this.rateLimitedAPIs = config.rateLimitedAPIs;
    this.handleRateLimitation = this.handleRateLimitation.bind(this);
  }

  async handleRateLimitation(req: Request, res: Response, next: NextFunction) {
    try {
      const currentTime = new Date().getTime();
      const key = req.path;
      // check if API has to be rate limited
      if (this.isRateLimitedAPI(key)) {
        // refresh the rate limit data (clear requests that are not eligible for the current time window)
        await this.refreshRateLimitData(key, currentTime);
        // check if the request can be allowed
        if (await this.isRequestAllowed(key, currentTime)) {
          next()
        } else {
          // return 429
          next(new TooManyRequestsError())
        }
      } else {
        next();
      }
    } catch (err) {
      // some error has happened in the redis client, log metrics and allow the request
      console.error('Error in handleRateLimitation', err)
      next();
    }

  }

  isRateLimitedAPI = (apiPath: string): boolean => {
    return this.rateLimitedAPIs.includes(apiPath);
  }

  refreshRateLimitData = async (key: string, currentTime: number) => {
    await redisClient.zRemRangeByScore(key, 0, currentTime - this.timeWindowInSeconds * 1000);
  }

  isRequestAllowed = async (key: string, currentTime: number): Promise<boolean> => {
    const score = currentTime
    const member: string = currentTime.toString()
    const currentRequestCount = await redisClient.zCard(key)

    if (currentRequestCount >= this.maxRequests) {
      return false
    } else {
      try {
        const response = await redisClient.zAdd(key, [{ score, value: member }]);
        console.log(`Added member ${member} with score ${score} to set ${key}. ZADD response: ${response}`);
      } catch (err) {
        console.error('Error adding element:', err);
      }
      redisClient.expire(key, this.timeWindowInSeconds);
      return true
    }
  }

}

export default RateLimiter;