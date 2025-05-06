const express = require('express');
const Reviewer = require('../../models/reviewers');
const router = express.Router();
const nodemailer= require('nodemailer')
const senderemail = "hexart637@gmail.com";
const EIR = require('../../models/EirSchema')
const GrantRequests = require('../../models/GrandSchemeSchema')
const Startup = require('../../models/startupmodel');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: senderemail,
        pass: 'zetk dsdm imvx keoa'
    }
});

/**
 * @swagger
 * /review/startups:
 *   get:
 *     summary: Get startups for review
 *     tags: [Reviewer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of startups for review
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
 *             examples:
 *               success:
 *                 summary: Example list of startups
 *                 value:
 *                   - _id: 65f1a1234567890abcdef123
 *                     company_name: Acme Corp
 *                     status: pending
 *                   - _id: 65f1a1234567890abcdef124
 *                     company_name: Beta Inc
 *                     status: approved
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
 *                 summary: Internal server error example
 *                 value:
 *                   error: Internal server error
 */
router.get('/startups', async (req, res) => {
    try {
        // Fetch all startups and map to required fields
        const startups = await Startup.find();
        const result = startups.map(s => ({
            _id: s._id,
            company_name: s.kyc?.company_name || '',
            status: s.kyc?.status || ''
        }));
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /review/submit:
 *   post:
 *     summary: Submit review for a startup
 *     tags: [Reviewer]
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
 *               - reviewer_id
 *               - review
 *               - rating
 *             properties:
 *               startup_id:
 *                 type: string
 *               reviewer_id:
 *                 type: string
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 eir:
 *                   type: object
 *             examples:
 *               success:
 *                 summary: Review submitted example
 *                 value:
 *                   message: Review submitted successfully
 *                   eir: { _id: "65f1a1234567890abcdef123", reviews: [ { reviewer_id: "abc123", rating: 5, comments: ["Great startup!"], status: "completed" } ] }
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
 *                 summary: Bad request example
 *                 value:
 *                   error: Missing required fields
 *       404:
 *         description: EIR not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               notFound:
 *                 summary: EIR not found example
 *                 value:
 *                   message: EIR not found
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
 *                 summary: Internal server error example
 *                 value:
 *                   error: Internal server error
 */
router.post('/submit', async (req, res) => {
    const { startup_id, reviewer_id, review, rating } = req.body;
    if (!startup_id || !reviewer_id || !review || typeof rating !== 'number') {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Find the EIR document for thvve startup
        const eir = await EIR.findOne({ startup_id });
        console.log('Received startup_id:', startup_id); 
        if (!eir) {
            return res.status(404).json({ message: 'EIR not found' });
        }
        // Optionally, fetch reviewer details
        const reviewer = await Reviewer.findById(reviewer_id);
        // Add the review to the EIR document
        eir.reviews.push({
            reviewer_id,
            reviewer_name: reviewer ? reviewer.name : '',
            reviewer_email: reviewer ? reviewer.email : '',
            reviewer_organization: reviewer ? reviewer.organization : '',
            status: 'completed',
            review_date: new Date(),
            rating,
            comments: [review]
        });
        await eir.save();
        res.status(200).json({ message: 'Review submitted successfully', eir });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    const { name, password, email , organization , about } = req.body;
    console.log(req.body);
    try {
      // Check if the email already exists
      const exists = await Reviewer.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      // Create a new reviewer without password encryption
      const newReviewer = new Reviewer({
        name,
        password, // store the plain text password directly
        email,
        organization,
        about
      });
      await newReviewer.save();
      const mailOptions = {
          from: senderemail,
          to: email,
          subject: 'startX',
          html: `
           <h1>You are registered as a reviewer on startx</h1>
          `
      };
      // Send the verification email
      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log("Mail sent successfully to receiver");
          }
      });
      // Save the reviewer to the database
      const savedUser = await newReviewer.save();
      // Store reviewer ID in session
      res.status(200).json({ message: 'Registration successful!', reviewerId: savedUser._id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to register reviewer' , erroris:error });
    }
  });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find reviewer by email
      const reviewer = await Reviewer.findOne({ email });
      if (!reviewer) return res.status(400).json({ error: 'Reviewer not found' });
     console.log(reviewer.email , reviewer.password , password);
      // Directly compare passwords without encryption
      if (password !== reviewer.password) {
        return res.status(400).json({ message: 'Invalid password' });
      }
      res.status(200).json({ message: 'Login successful', reviewerId: reviewer._id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log in' });
    }
  });

// Add a reviewer
router.post('/add-reviewer', async (req, res) => {
    try {
        const newReviewer = new Reviewer(req.body);
        await newReviewer.save();
        res.status(201).json(newReviewer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all reviewers
router.get('/reviewers', async (req, res) => {
    try {
        const reviewers = await Reviewer.find();
        res.status(200).json(reviewers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all reviews for a specific reviewer
router.get('/:reviewerId/reviews', async (req, res) => {
  try {
    const reviewer = await Reviewer.findById(req.params.reviewerId);
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }
    // Populate review details from EIR documents
    const reviews = await EIR.find({
      'reviews.reviewer_id': req.params.reviewerId
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching reviews', error: error.message });
  }
});
//......
router.get('/:reviewerId/grantreviews', async (req, res) => {
  try {
    const reviewer = await Reviewer.findById(req.params.reviewerId);
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }
    // Populate review details from EIR documents
    const reviews = await GrantRequests.find({
      'reviews.reviewer_id': req.params.reviewerId
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching reviews', error: error.message });
  }
});

router.post('/eir/:eir/:reviewer' , async (req, res) => {
  try {
    EIR.findById(req.params.eir).then((eir) => {
      if (!eir) {
        return res.status(404).json({ message: 'EIR not found' });
      }
      // Add new review to the EIR document
      eir.reviews.forEach((review) => {
        if (review.reviewer_id === req.params.reviewer) {
          review.rating = req.body.rating;
          review.comments.push(req.body.comment);
          review.status="completed"
        }
      })
      eir.save().then((savedEir) => {
        res.status(200).json(savedEir);
      })
      
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while'})
  }
})
router.post('/grants/:grant/:reviewer' , async (req, res) => {
  try {
    GrantRequests.findById(req.params.grant).then((grant) => {
      if (!grant) {
        return res.status(404).json({ message: 'EIR not found' });
      }
      // Add new review to the EIR document
      grant.reviews.forEach((review) => {
        if (review.reviewer_id === req.params.reviewer) {
          review.rating = req.body.rating;
          review.comments.push(req.body.comment);
          review.status="completed"
        }
      })
      grant.save().then((savedEir) => {
        res.status(200).json(savedEir);
      })
      
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while'})
  }
})

module.exports = router;
