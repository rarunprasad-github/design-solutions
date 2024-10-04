import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: 'redis://localhost:6379',
});

redisClient.connect()
  .then(() => console.log('Redis client connected'))
  .catch(err => console.error('Redis connection error:', err));

export default redisClient;
