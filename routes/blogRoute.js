const blogController = require('./controller/blog.js');
const authController = require('../controller/registration.js');
const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const router = express.Router();

router.get('/', blogController.getBlog);
router.get('/:authorId', authMiddleware(), blogController.getBlogByAuthor);
router.post('/search', authMiddleware(), blogController.searchBlog);
router.post('/', authMiddleware(), blogController.addBlog);

router.put("/updateBlog/:blogId", authMiddleware(), blogController.editBlog);
router.delete("/deleteBlog/:blogId", authMiddleware(), blogController.deleteBlog);

module.exports = router;