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
 *               - address
 *               - contact_person
 *               - company_details
 *             properties:
 *               company_name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_person:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               company_details:
 *                 type: object
 *                 required:
 *                   - industry
 *                 properties:
 *                   incorporation_date:
 *                     type: string
 *                     format: date
 *                   industry:
 *                     type: string
 *                   website:
 *                     type: string
 *                   pan_number:
 *                     type: string
 *                   about:
 *                     type: string
 *               profile_picture:
 *                 type: string
 *                 description: URL or path to the profile picture
 *     responses:
 *       201:
 *         description: Startup details submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 startup:
 *                   $ref: '#/components/schemas/Startup'
 *             examples:
 *               success:
 *                 summary: Example response
 *                 value:
 *                   message: Startup details submitted successfully
 *                   startup:
 *                     kyc:
 *                       company_name: Acme Corp
 *                       address: 123 Main St
 *                       contact_person:
 *                         name: John Doe
 *                         email: john@acme.com
 *                         phone: '1234567890'
 *                       company_details:
 *                         incorporation_date: '2023-01-01'
 *                         industry: Tech
 *                         website: https://acme.com
 *                         pan_number: ABCD1234E
 *                         about: Innovative solutions
 *                       profile_picture: https://example.com/pic.jpg
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               badRequest:
 *                 summary: Missing required fields
 *                 value:
 *                   error: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               serverError:
 *                 summary: Internal server error
 *                 value:
 *                   error: Server error
 */
router.post('/startup', async (req, res) => {
    const { company_name, address, contact_person, company_details, profile_picture } = req.body;
    if (!company_name || !address || !contact_person || !company_details) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const newStartup = new Startup({
            kyc: {
                company_name,
                address,
                contact_person,
                company_details,
                profile_picture: profile_picture || ''
            },
            progress: [],
            reports: [],
            messages: [],
            grants: []
        });
        await newStartup.save();
        res.status(201).json({ message: 'Startup details submitted successfully', startup: newStartup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

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
 *               - month
 *               - milestones
 *               - issues_faced
 *               - financials
 *             properties:
 *               startup_id:
 *                 type: string
 *               month:
 *                 type: string
 *               milestones:
 *                 type: string
 *               issues_faced:
 *                 type: string
 *               financials:
 *                 type: object
 *                 required:
 *                   - revenue
 *                   - expenses
 *                 properties:
 *                   revenue:
 *                     type: number
 *                   expenses:
 *                     type: number
 *     responses:
 *       201:
 *         description: Progress submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 startup:
 *                   $ref: '#/components/schemas/Startup'
 *             examples:
 *               success:
 *                 summary: Example response
 *                 value:
 *                   message: Progress submitted successfully
 *                   startup:
 *                     _id: 65f1a1234567890abcdef123
 *                     progress:
 *                       - month: '2024-05'
 *                         milestones: 'Launched MVP'
 *                         issues_faced: 'Scaling issues'
 *                         financials:
 *                           revenue: 10000
 *                           expenses: 8000
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               badRequest:
 *                 summary: Missing required fields
 *                 value:
 *                   error: Missing required fields
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
 *                 summary: Startup not found
 *                 value:
 *                   message: Startup not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               serverError:
 *                 summary: Internal server error
 *                 value:
 *                   error: Server error
 */
router.post('/progress', async (req, res) => {
    const { startup_id, month, milestones, issues_faced, financials } = req.body;
    if (!startup_id || !month || !milestones || !issues_faced || !financials || typeof financials.revenue !== 'number' || typeof financials.expenses !== 'number') {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const startup = await Startup.findById(startup_id);
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }
        const newProgress = { month, milestones, issues_faced, financials };
        startup.progress.push(newProgress);
        await startup.save();
        res.status(201).json({ message: 'Progress submitted successfully', startup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router



