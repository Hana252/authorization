//my schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    following: [{ 
        type: String 
    }],
});


const blogSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    body: { 
        type: String, 
        required: true 
    },
    photo: { 
        type: String 
    }, 
    author: { 
        type: String, 
        required: true 
    }, 
    tags: [{ 
        type: String 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);
User.createIndexes({username:1})
Blog.createIndexes({title:1})

module.exports = {
    User,
    Blog,
};



