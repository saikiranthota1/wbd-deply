const express = require('express');
const router = express.Router();
const User = require("../../models/usermodel");
const StartupModel = require("../../models/startupmodel");
const EIR = require("../../models/EirSchema");  // Assuming you named your EIR model file as eirmodel.js
const GrantScheme = require("../../models/GrandSchemeSchema"); // Assuming you named your Grant model file as grantschememodel.js

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profile_pic:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/home/:user/:startup", async function (req, res) {
  try {
    // Find user
    const user = await User.findById(req.params.user).select('username email startup');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find startup
    const startup = await StartupModel.findById(req.params.startup);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Search in EIR collection
    const eirRecords = await EIR.find({ startup_id: req.params.startup });
    // Search in GrantScheme collection
    const grantRecords = await GrantScheme.find({ "startup_id": req.params.startup });

    // Send response with user, startup, eirRecords, and grantRecords
    res.status(200).send({
      user,
      startup,
      eirRecords,
      grantRecords
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /user/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update-profile', async (req, res) => {
    const { userId, username } = req.body;
    if (!userId || !username) {
        return res.status(400).json({ error: 'userId and username are required.' });
    }
    try {
        const user = await User.findByIdAndUpdate(userId, { username }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /user/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 startup:
 *                   type: string
 *             examples:
 *               success:
 *                 summary: Example user profile
 *                 value:
 *                   username: johndoe
 *                   email: johndoe@example.com
 *                   startup: 65f1a1234567890abcdef123
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               notFound:
 *                 summary: User not found example
 *                 value:
 *                   message: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               serverError:
 *                 summary: Internal server error example
 *                 value:
 *                   error: Internal server error
 */
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('username email startup');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
