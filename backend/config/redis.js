const { createClient } = require('redis');

class RedisClient {
    constructor() {
        this.client = createClient({
            username: 'default',
            password: '64chugMqAEM48LGChE8u5cecyn0mrDG2',
            socket: {
                host: 'redis-11788.c56.east-us.azure.redns.redis-cloud.com',
                port: 11788
            }
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });
    }

    async connect() {
        try {
            await this.client.connect();
            return true;
        } catch (error) {
            console.error('Redis Connection Error:', error);
            return false;
        }
    }

    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET Error:', error);
            return null;
        }
    }

    async set(key, value, expireTime = 3600) {
        try {
            const stringValue = JSON.stringify(value);
            await this.client.set(key, stringValue, { EX: expireTime });
            return true;
        } catch (error) {
            console.error('Redis SET Error:', error);
            return false;
        }
    }
}

module.exports = new RedisClient();