// my routes
const express = require('express');
const jwt = require('jsonwebtoken');
const appController = require('../controllers/appController'); 
const router = express.Router();

// Register a new user
// a route, with POST request that expects a username, email, and password in the request body
//
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const result = await appController.registerUser(username, email, password);

    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await appController.loginUser(username, password);

    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});



// Create a new blog post
router.post('/blogs', async (req, res) => {
    const { title, body, photo, author, tags } = req.body;
    const result = await appController.createBlog(title, body, photo, author, tags);

    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

// Get the latest blog posts
router.get('/blogs/latest', async (req, res) => {
    const result = await appController.getLatestBlogs();

    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Search blogs by author, title, or tags
router.get('/blogs/search', async (req, res) => {
    const { query } = req.query;
    const result = await appController.searchBlogs(query);

    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

module.exports = router;
