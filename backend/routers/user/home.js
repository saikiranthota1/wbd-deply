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
    const user = await User.findById(req.params.user);
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
 *               profile_pic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update-profile', async (req, res) => {
    // ... existing code ...
});

module.exports = router;
