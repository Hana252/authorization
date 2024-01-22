const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const appRoute = require('./models/appModel');


const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb://127.0.0.1:27017/Blogs').then(() => {
    console.log("connected to Database");
}).catch(err => {
    console.log(err);
})
app.use(express.urlencoded({extended:true}));
app.use('/app', appRoute);
app.use(bodyParser.urlencoded({ extended: true }));
Router.use()

// Mock Database
const users = [];
const blogs = [];

// Middleware for verifying JWT token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

// API endpoint for registering a new user
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = users.find(u => u.username == username);
    if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
        return;
    }

    const user = { id: users.length + 1, username, email, password };
    users.push(user);

    res.json({
        message: 'User registered successfully',
        user
    });
});

// API endpoint for user login // it is not done yet
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

const user = users.find(u => u.username === username && u.password === password);
console.log(u.user);
if (req.user) {
    res.status(401).send('Unauthorized'); 
    // display Unauthorized even if the user has already exist
    return;
}

    jwt.sign({ user }, 'secretKey', { expiresIn: '30s' }, (err, token) => {
        res.json({
            token
        });
    });
});

// API endpoint for creating a new blog post
app.post('/api/posts', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const { title, body, photo, tags } = req.body;
            const author = authData.user.username;
            const blog = { title, body, photo, author, tags };
            blogs.push(blog);

            res.json({
                message: 'Post created successfully',
                blog,
                authData
            });
        }
    });
});

// API endpoint for getting the latest blog posts
app.get('/api/home', (req, res) => {//done
    const latestBlogs = blogs.slice(-10).reverse(); // Get the latest 10 blogs
    res.json({
        latestBlogs
    });
});

// API endpoint for searching blogs by author, title, or tags
app.get('/api/search', (req, res) => {//done
    const { query } = req.query;
    const results = blogs.filter(blog => {
        return (
            blog.author.toLowerCase().includes(query.toLowerCase()) ||
            blog.title.toLowerCase().includes(query.toLowerCase()) ||
            blog.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
    });

    res.json({
        results
    });
});


// API endpoint for editing a blog post
app.put('/api/posts/:postId', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const postId = parseInt(req.params.postId);
            const { title, body, photo, tags } = req.body;

            const blogIndex = blogs.findIndex(blog => blog.id === postId && blog.author === authData.user.username);

            if (blogIndex !== -1) {
                blogs[blogIndex] = { ...blogs[blogIndex], title, body, photo, tags };

                res.json({
                    message: 'Post updated successfully',
                    blog: blogs[blogIndex]
                });
            } else {
                res.status(404).json({ error: 'Post not found or unauthorized' });
            }
        }
    });
});

// API endpoint for deleting a blog post
// app.delete('/api/posts/:postId', verifyToken, (req, res) => {
//     jwt.verify(req.token, 'secretKey', (err, authData) => {
//         if (err) {
//             res.sendStatus(403);
//         } else {
//             const postId = parseInt(req.params.postId);

//             const blogIndex = blogs.findIndex(blog => blog.id === postId && blog.author === authData.user.username);

//             if (blogIndex !== -1) {
//                 const deletedBlog = blogs.splice(blogIndex, 1);

//                 res.json({
//                     message: 'Post deleted successfully',
//                     blog: deletedBlog[0]
//                 });
//             } else {
//                 res.status(404).json({ error: 'Post not found or unauthorized' });
//             }
//         }
//     });
// });

// API endpoint for following/unFollowing a user
app.post('/api/follow/:username', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const targetUsername = req.params.username;

            if (targetUsername === authData.user.username) {
                res.status(400).json({ error: 'Cannot follow yourself' });
                return;
            }

            const targetUser = users.find(user => user.username === targetUsername);

            if (targetUser) {
                const isAlreadyFollowing = authData.user.following.includes(targetUsername);

                if (isAlreadyFollowing) {
                    authData.user.following = authData.user.following.filter(username => username !== targetUsername);
                    res.json({ message: 'UnFollowed successfully', following: authData.user.following });
                } else {
                    authData.user.following.push(targetUsername);
                    res.json({ message: 'Followed successfully', following: authData.user.following });
                }
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
});

// API endpoint for viewing a user's profile
app.get('/api/profile/:username', (req, res) => {
    const targetUsername = req.params.username;

    const targetUser = users.find(user => user.username === targetUsername);

    if (targetUser) {
        const userBlogs = blogs.filter(blog => blog.author === targetUsername);

        res.json({
            profile: {
                username: targetUser.username,
                email: targetUser.email,
                following: targetUser.following,
                blogs: userBlogs
            }
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});



// API endpoint for getting paginated blog posts
// app.get('/api/home', (req, res) => { //done
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = 10; // Number of blogs per page
//     const startIndex = (page - 1) * pageSize;
//     const endIndex = startIndex + pageSize;

//     const paginatedBlogs = blogs.slice(startIndex, endIndex).reverse();

//     res.json({
//         paginatedBlogs,
//         currentPage: page,
//         totalPages: Math.ceil(blogs.length / pageSize)
//     });
// });

// API endpoint for searching blogs with pagination
// app.get('/api/search', (req, res) => {//done
//     const { query, page } = req.query;
//     const pageSize = 10; // Number of blogs per page
//     const startIndex = (page - 1) * pageSize;
//     const endIndex = startIndex + pageSize;

//     const results = blogs.filter(blog => {
//         return (
//             blog.author.toLowerCase().includes(query.toLowerCase()) ||
//             blog.title.toLowerCase().includes(query.toLowerCase()) ||
//             blog.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
//         );
//     });

//     const paginatedResults = results.slice(startIndex, endIndex);

//     res.json({
//         paginatedResults,
//         currentPage: parseInt(page) || 1,
//         totalPages: Math.ceil(results.length / pageSize)
//     });
// });


app.listen(5000, () => console.log('server started on port 5000'));
