const Redis = require('redis');
const { promisify } = require('util');

class RedisClient {
    constructor() {
        this.client = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        // Promisify Redis methods
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
        this.existsAsync = promisify(this.client.exists).bind(this.client);
    }

    async get(key) {
        try {
            const data = await this.getAsync(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis GET Error:', error);
            return null;
        }
    }

    async set(key, value, expireTime = 3600) { // Default expiry: 1 hour
        try {
            const stringValue = JSON.stringify(value);
            await this.setAsync(key, stringValue, 'EX', expireTime);
            return true;
        } catch (error) {
            console.error('Redis SET Error:', error);
            return false;
        }
    }

    async delete(key) {
        try {
            await this.delAsync(key);
            return true;
        } catch (error) {
            console.error('Redis DELETE Error:', error);
            return false;
        }
    }

    async exists(key) {
        try {
            return await this.existsAsync(key);
        } catch (error) {
            console.error('Redis EXISTS Error:', error);
            return false;
        }
    }
}

module.exports = new RedisClient(); 