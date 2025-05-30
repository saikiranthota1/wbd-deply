const express = require('express');
const User = require('../../models/usermodel');
const Startup = require("../../models/startupmodel");
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { upload } = require('../../storage/storage'); // <-- Cloudinary upload

const senderemail = "hexart637@gmail.com";


// Helper to fetch Google user info
async function getUserInfo(accessToken) {
    try {
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
        );
        return userRes.data;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching user info from Google');
    }
}

// Register user
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({
            username,
            password,
            email,
        });

        await newUser.save();

        res.status(200).json({
            message: 'Registration successful!',
            userId: newUser._id,
            profile_pic: newUser.profile_pic
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to register user', erroris: error });
    }
});

// Submit KYC
router.post('/kyc', async (req, res) => {
    const {
        company_name, address, contact_person_name, contact_person_email,
        contact_person_phone, incorporation_date, industry, website, user
    } = req.body;

    try {
        const newKYC = new Startup({
            kyc: {
                company_name,
                address,
                contact_person: {
                    name: contact_person_name,
                    email: contact_person_email,
                    phone: contact_person_phone
                },
                company_details: {
                    incorporation_date,
                    industry,
                    website
                }
            },
            progress: [],
            reports: [],
            messages: [],
            grants: [],
        });

        const savedKYC = await newKYC.save();
        await User.findByIdAndUpdate(user, { startup: savedKYC._id });

        res.status(200).json({ message: 'KYC details submitted successfully', startup: savedKYC._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to submit KYC details', erroris: error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        // Plain password match (use bcrypt in production)
        if (password !== user.password) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful', userId: user._id, startup: user.startup });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Google OAuth Login
router.get('/google', async function (req, res) {
    try {
        const { tokens } = req.query;
        const userInfo = await getUserInfo(tokens.access_token);
        const { email, name } = userInfo;

        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(200).send({ message: "Email Already Exists", userId: userExists._id, startup: userExists.startup });
        }

        const newUser = new User({
            username: name,
            email: email,
            profile_pic: "",
            company: "",
            items: []
        });

        await newUser.save();
        return res.status(200).send({ message: "Account Created Successfully", userId: newUser._id });
    } catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).send("An error occurred during Google login.");
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Failed to log out' });
        res.status(200).json({ message: 'Logout successful' });
    });
});

module.exports = router;
