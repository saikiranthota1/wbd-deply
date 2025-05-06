const express = require('express');
const router = express.Router();
const Startup = require('../../models/startupmodel');
const redisClient = require('../../config/redis');

// Global cache expiry time (1 hour in seconds)
const CACHE_EXPIRY_TIME = 5;

// Initialize Redis connection
(async () => {
    try {
        await redisClient.client.connect();
    } catch (error) {
        console.error('Redis connection error:', error);
    }
})();

/**
 * @swagger
 * /get/startups:
 *   get:
 *     summary: Get all startups
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of startups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   company_name:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/startups', async (req, res) => {
    try {
        if (!redisClient.client.isReady) {
            throw new Error('Redis client not ready');
        }

        const cachedStartups = await redisClient.get('all_startups');
        if (cachedStartups) {
            console.log('[Redis] Cache HIT for all startups');
            return res.status(200).json(cachedStartups);
        }

        console.log('[Redis] Cache MISS for all startups');
        const startups = await Startup.find();
        await redisClient.set('all_startups', startups, CACHE_EXPIRY_TIME);
        res.status(200).json(startups);
    } catch (err) {
        console.error('Startups fetch error:', err);
        // Fallback to database if Redis fails
        try {
            const startups = await Startup.find();
            res.status(200).json(startups);
        } catch (dbErr) {
            console.error(dbErr);
            res.status(500).json({ message: 'Server Error' });
        }
    }
});

/**
 * @swagger
 * /get/startup/{id}:
 *   get:
 *     summary: Get startup by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the startup
 *     responses:
 *       200:
 *         description: Startup details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 kyc:
 *                   type: object
 *                 progress:
 *                   type: array
 *                   items:
 *                     type: object
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                 grants:
 *                   type: array
 *                   items:
 *                     type: object
 *             examples:
 *               success:
 *                 summary: Example startup
 *                 value:
 *                   _id: 65f1a1234567890abcdef123
 *                   kyc: { company_name: "Acme Corp", address: "123 Main St" }
 *                   progress: []
 *                   reports: []
 *                   messages: []
 *                   grants: []
 *       404:
 *         description: Startup not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               notFound:
 *                 summary: Startup not found example
 *                 value:
 *                   message: Startup not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               serverError:
 *                 summary: Server error example
 *                 value:
 *                   message: Server error
 */
router.get('/startup/:id', async (req, res) => {
    try {
        // Check if Redis client is ready to accept commands
        if (!redisClient.client.isReady) {
            throw new Error('Redis client not ready');
        }

        const startupId = req.params.id;
        console.log(`[Redis] Attempting to fetch startup ${startupId} from cache`);
        
        // Try to get startup data from Redis cache
        const cachedStartup = await redisClient.get(`startup:${startupId}`);
        
        // Cache HIT: Return cached data if found
        if (cachedStartup) {
            console.log(`[Redis] Cache HIT for startup ${startupId}`);
            return res.status(200).json(cachedStartup);
        }

        console.log(`[Redis] Cache MISS for startup ${startupId}`);
        // Cache MISS: Fetch from database
        const startup = await Startup.findById(startupId);
        if (!startup) {
            console.log(`[DB] Startup ${startupId} not found in database`);
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Update cache with new data
        console.log(`[Redis] Caching startup ${startupId} data with ${CACHE_EXPIRY_TIME}s expiry`);
        await redisClient.set(`startup:${startupId}`, startup, CACHE_EXPIRY_TIME);
        
        res.status(200).json(startup);
    } catch (error) {
        console.error('Startup fetch error:', error);
        // Fallback to database if Redis fails
        try {
            const startup = await Startup.findById(req.params.id);
            if (!startup) {
                return res.status(404).json({ message: 'Startup not found' });
            }
            res.status(200).json(startup);
        } catch (dbErr) {
            console.error(dbErr);
            res.status(500).json({ message: 'Server error' });
        }
    }
});

// Clear cache when startup data is updated
router.post('/clear-cache', async (req, res) => {
    try {
        await redisClient.delete('all_startups');
        if (req.body.startupId) {
            await redisClient.delete(`startup:${req.body.startupId}`);
        }
        res.status(200).json({ message: 'Cache cleared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error clearing cache' });
    }
});

router.get('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        
        // Try to get messages from cache first
        const cachedMessages = await redisClient.get(`messages:${messageId}`);
        if (cachedMessages) {
            console.log(`[Redis] Cache HIT for messages ${messageId}`);
            return res.status(200).json(cachedMessages);
        }

        console.log(`[Redis] Cache MISS for messages ${messageId}`);
        const messages = await Messages.findOne({startup_id: messageId});
        
        // Cache messages for 15 minutes since they update frequently
        console.log(`[Redis] Caching messages ${messageId} with ${CACHE_EXPIRY_TIME}s expiry`);
        await redisClient.set(`messages:${messageId}`, messages, CACHE_EXPIRY_TIME);
        
        res.status(200).json(messages);
    } catch (err) {
        console.error('Messages fetch error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
