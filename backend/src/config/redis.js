const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

// Connect to Redis
const connectRedis = async () => {
    await redisClient.connect();
};

// Save something in Redis cache
// key = what to call it, data = what to save, expiry = how long in seconds
const setCache = async (key, data, expiry = 300) => {
    try {
        await redisClient.setEx(key, expiry, JSON.stringify(data));
    } catch (error) {
        console.error('Redis set error:', error);
    }
};

// Get something from Redis cache
const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

// Delete something from Redis cache
const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Redis delete error:', error);
    }
};

module.exports = {
    redisClient,
    connectRedis,
    setCache,
    getCache,
    deleteCache,
};