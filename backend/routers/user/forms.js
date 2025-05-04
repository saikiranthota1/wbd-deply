const express = require('express');
const router = express.Router();
const eirmodel = require('../../models/EirSchema')
const grantmodel = require("../../models/GrandSchemeSchema")
const Startup = require('../../models/startupmodel');
const { log } = require('node:console');

/**
 * @swagger
 * /submit/startup:
 *   post:
 *     summary: Submit startup details
 *     tags: [Startup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - description
 *               - industry
 *             properties:
 *               company_name:
 *                 type: string
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               funding_needed:
 *                 type: number
 *     responses:
 *       201:
 *         description: Startup details submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/eir/:startup", async function (req, res) {
    const { entrepreneur, startup_name, objectives } = req.body; // Extract data from request body
    const startup_id = req.params.startup; // Get startup ID from URL
    const newEirDetail = new eirmodel({
        startup_id,
        entrepreneur,
        startup_name,
        objectives,
    })
    try {
        await newEirDetail.save(); // Save to database
        res.status(201).send(newEirDetail); // Respond with created resource
    } catch (error) {
        res.status(500).send(error); // Handle errors
    }
})

router.post("/funds/:startup", async function (req, res) {
    try {
        // Make sure the body exists
        const { name, organization, email, phone,pan, aadhar, address, project_title, description, total_funding_required, funding_breakdown } = req.body;

        // Log the request body to ensure it's being received correctly
        console.log('Received data:', req.body)
        // Create a new grant application
        const newGrant = new grantmodel({
            startup_id: req.params.startup,
            applicant: {
                name,
                organization,
                pan,
                aadhar_num:aadhar,
                contact_details: { email, phone, address },
            },
            project_proposal: {
                project_title,
                description,
                budget: {
                    total_funding_required,
                    funding_breakdown,
                },
            },
        });

        // Save the grant application to the database
        await newGrant.save();
        res.status(201).json({ message: 'Grant application submitted successfully!', grant: newGrant });
    } catch (error) {
        console.error('Error in grant submission:', error);
        res.status(500).json({ message: 'Failed to submit grant application.', error: error.message });
    }
});

router.post("/reports/:startup" ,async function(req, res) {
        const { startup } = req.params;
        const { month, milestones, issues, financials } = req.body;
        console.log(req.body);
        try {
          const editstartup = await Startup.findById(startup);
          if (!editstartup) {
            return res.status(404).json({ message: 'Startup not found' });
          }
          // Create a new progress entry
          const newProgress = {
            month,
            milestones,
            issues_faced: issues, // Ensure this is the expected field
            financials,
          };
          // Push the new progress entry into the progress array
          editstartup.progress.push(newProgress);
          console.log(editstartup);
          // Save the updated startup document
          await editstartup.save();
          return res.status(200).json({ message: 'Progress updated successfully', startup });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Server error', error });
        }
});

/**
 * @swagger
 * /submit/progress:
 *   post:
 *     summary: Submit startup progress
 *     tags: [Startup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startup_id
 *               - milestone
 *               - description
 *             properties:
 *               startup_id:
 *                 type: string
 *               milestone:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Progress submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/progress', async (req, res) => {
    // ... existing code ...
});

module.exports = router



