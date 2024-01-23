// functions controller
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

// // Search blogs by author, title, or tags
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

// const userModel = require("../models/appModel.js");
// const { compare, hash, generateToken, asyncHandler } = require("../controllers/allController.js");

// const getAllUsers = asyncHandler(async (req, res, next) => {
//   const users = await userModel.find();
//   if (!users) {
//     return next(new Error("No User Found", { cause: 409 }));
//   }
//   res.status(201).json({ success: true, data: users });
// });

// const getOneUser = asyncHandler(async (req, res, next) => {
//   const userId = req.params.userId;

//   const user = await userModel.findById(userId);
//   if (!user) {
//     return next(new Error("No User Found", { cause: 409 }));
//   }
//   res.status(201).json({ success: true, data: user });
// });

// const signup = asyncHandler(async (req, res, next) => {
//   const { firstName, lastName, email, gender, password, cPassword } = req.body;
//   const userName = `${firstName} ${lastName}`;
//   const checkUser = await userModel.findOne({ email });
//   if (checkUser) {
//     return next(new Error("email exist", { cause: 409 }));
//   }
//   if (!(cPassword == password)) {
//     return next(new Error('Passwords do not match', { cause: 420 }));
//   }

//   const hashPassword = hash({ plaintext: password });
//   const { _id } = await userModel.create({
//     userName,
//     email,
//     gender,
//     password: hashPassword,
//     confirmEmail: true
//   });
//   res.status(200).json({ message: "User created successfully!", userId: _id });
// });

// const login = asyncHandler(async (req, res, next) => {
//   const { email, password } = req.body;
//   const user = await userModel.findOne({ email });
//   if (!user) {
//     return next(new Error("not registered email", { cause: 404 }));
//   }
//   if (!user.confirmEmail) {
//     return next(new Error("please confirm your email first", { cause: 400 }));
//   }
//   if (user.status == "blocked") {
//     return next(new Error("your account has been blocked by admin please contact with our support team"));
//   }
//   if (!compare({ plaintext: password, hashValue: user.password })) {
//     return next(new Error("invalid email or password", { cause: 400 }));
//   }
//   const access_token = generateToken({
//     payload: { id: user._id, role: user.role, status: user.status },
//     expiresIn: 60 * 30,
//   });
//   const refresh_token = generateToken({
//     payload: { id: user._id, role: user.role, status: user.status },
//     expiresIn: 30,
//   });
//   user.status = "online";
//   await user.save();
//   res.status(200).json({
//     message: "User login successfully!",
//     access_token,
//     refresh_token,
//     user,
//   });
// });

// const addFollower = asyncHandler(async (req, res, next) => {
//   const followingId = req.params.followingId;
//   const userId = req.user;
//   const followed = await userModel.findById(followingId);
//   const follower = await userModel.findById(userId);
//   if (followed.followers.includes(userId)) {
//     return next(new Error("you follow this user exactly", { cause: 400 }));
//   }
//   if (follower.following.includes(followingId)) {
//     return next(new Error("this user are following by you", { cause: 400 }));
//   }
//   await userModel.findOneAndUpdate(
//     { _id: followingId },
//     { $push: { followers: userId } },
//     { returnOriginal: false }
//   );
//   await userModel.findOneAndUpdate(
//     { _id: userId },
//     { $push: { following: followingId } },
//     { returnOriginal: false }
//   );
//   res.status(200).json({ message: "followed successfully" });
// });

// const deleteFollower = asyncHandler(async (req, res, next) => {
//   const followingId = req.params.followingId;
//   const userId = req.user;
//   const followed = await userModel.findById(followingId);
//   const follower = await userModel.findById(userId);
//   if (!followed.followers.includes(userId)) {
//     return next(new Error("you are not follow this user", { cause: 400 }));
//   }
//   if (!follower.following.includes(followingId)) {
//     return next(new Error("this user are not following by you", { cause: 400 }));
//   }
//   await userModel.findOneAndUpdate(
//     { _id: followingId },
//     { $pull: { followers: userId } },
//     { returnOriginal: false })
    
//     await userModel.findOneAndUpdate(
//       { _id: userId },
//       { $pull: { following: followingId } },
//       { returnOriginal: false })
//   res.status(200).json({message:"unFollowed successfully"})

// });
// module.exports ={
//     getAllUsers,
//     getOneUser,
//     signup,
//     login,
//     addFollower,
//     deleteFollower,
// }