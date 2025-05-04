const express = require('express');
const router = express.Router();
const Startup = require('../../models/startupmodel');
const redisClient = require('../../config/redis');

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
        // Try to get data from Redis cache first
        const cachedStartups = await redisClient.get('all_startups');
        if (cachedStartups) {
            return res.status(200).json(cachedStartups);
        }

        // If not in cache, fetch from database
        const startups = await Startup.find();
        
        // Cache the data for 1 hour
        await redisClient.set('all_startups', startups, 3600);
        
        res.status(200).json(startups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
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
 *         description: Startup ID
 *     responses:
 *       200:
 *         description: Startup details retrieved successfully
 *       404:
 *         description: Startup not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/startup/:id', async (req, res) => {
    try {
        const startupId = req.params.id;
        
        // Try to get data from Redis cache first
        const cachedStartup = await redisClient.get(`startup:${startupId}`);
        if (cachedStartup) {
            return res.status(200).json(cachedStartup);
        }

        // If not in cache, fetch from database
        const startup = await Startup.findById(startupId);
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Cache the data for 1 hour
        await redisClient.set(`startup:${startupId}`, startup, 3600);
        
        res.status(200).json(startup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
      // Fetch all startups and only the required fields
      const messages = await Messages.findOne({startup_id: req.params.id});
      // Format the data for the response
      // Send the formatted data
      res.status(200).send(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

module.exports = router;
