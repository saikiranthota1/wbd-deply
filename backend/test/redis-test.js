import redisClient from '../config/redis.js';

async function testRedis() {
    await redisClient.connect();
    
    await redisClient.set('test', { hello: 'world' });
    const result = await redisClient.get('test');
    console.log(result);
}

testRedis().catch(console.error);
