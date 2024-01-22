// my functions
const {User, Blog} = require('../models/appModel');


// Register a new user
async function registerUser(username, email, password) {
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return { success: false, error: 'Username or email already exists' };
        }

        const user = new User({ username, email, password });
        await user.save();

        return { success: true, user };
    } catch (error) {
        return { success: false, error: 'Error registering user' };
    }
}

// Login user and generate JWT token
async function loginUser(username, password) {
    try {
        const user = await User.findOne({ username, password });

        if (!user) {
            return { success: false, error: 'Invalid username or password' };
        }

        // Generate JWT token
        const token = jwt.sign({ user }, 'secretKey', { expiresIn: '30s' });

        return { success: true, token };
    } catch (error) {
        return { success: false, error: 'Error logging in user' };
    }
}

// Blog Controller Functions

// Create a new blog post
async function createBlog(title, body, photo, author, tags) {
    try {
        const blog = new Blog({ title, body, photo, author, tags });
        await blog.save();

        return { success: true, blog };
    } catch (error) {
        return { success: false, error: 'Error creating blog post' };
    }
}

// Get the latest blog posts
async function getLatestBlogs() {
    try {
        const latestBlogs = await Blog.find().sort({ createdAt: -1 }).limit(10);

        return { success: true, latestBlogs };
    } catch (error) {
        return { success: false, error: 'Error getting latest blogs' };
    }
}

// Search blogs by author, title, or tags
async function searchBlogs(query) {
    try {
        const results = await Blog.find({
            $or: [
                { author: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
            ],
        });

        return { success: true, results };
    } catch (error) {
        return { success: false, error: 'Error searching blogs' };
    }
}

module.exports = {
    registerUser,
    loginUser,
    createBlog,
    getLatestBlogs,
    searchBlogs,
};
