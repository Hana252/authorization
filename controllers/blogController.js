const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const blogModel = require("../models/blogModel");
const { asyncHandler } = require("../controllers/allController.js");
const userModel = require("../models/appModel.js");
const __dirname = fileURLToPath(import.meta.url);

const getBlog = asyncHandler(async (req, res, next) => {
    const blogs = await blogModel.find();
    if (blogs.length == 0) {
        return next(new Error("no blogs found", { cause: 404 }));
    }
    res.status(200).json({ message: "done", blogs });
});

const getBlogByAuthor = asyncHandler(async (req, res, next) => {
    const author = req.params.authorId;
    const blogs = await blogModel.find({ author: author }).populate("author");
    if (blogs.length == 0) {
        return next(new Error("no blogs found", { cause: 404 }));
    }
    res.status(200).json({ message: "done", blogs });
});

const addBlog = asyncHandler(async (req, res, next) => {
    const { title, body, tags } = req.body;
    const userId = req.user;

    const newBlog = await blogModel.create({ title, body, author: userId, tags });
    if (!newBlog) {
        return next(new Error("can not add blog", { cause: 404 }));
    }
    res.status(200).json({ message: "blog created successfully", newBlog });
});

const blogPhoto = asyncHandler(async (req, res, next) => {
    const blogId = req.params.blogId;
    const userId = req.user;
    const blogPhoto = req.file;
    const blog = await blogModel.findById(blogId);
    if (!blog) {
        return next(new Error("No blog found with this Id!", { cause: 400 }));
    }
    if (blog.author != userId) {
        return next(new Error("you can only update your blog", { cause: 400 }));
    }
    if (blog.photo) {
        const oldImagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "..",
            `${blog.urlToUpdate}`
        );
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
    const fullPath = blogPhoto.finalDest;
    const newBlog = await blogModel.findByIdAndUpdate(blog, {
        urlToUpdate: fullPath,
        photo: fullPath,
    });
    res
        .status(200)
        .json({ message: "User image updated successfully!", newBlog });
});

const editBlog = asyncHandler(async (req, res, next) => {
    const { title, body, tags } = req.body;
    const blogId = req.params.blogId;
    const userId = req.user;
    const existBlog = await blogModel.findById(blogId);
    if (!existBlog) {
        return next(new Error("No blog found with this Id!", { cause: 400 }));
    }
    if (existBlog.author != userId) {
        return next(new Error("you can only update your blog", { cause: 400 }));
    }
    const blog = await blogModel.findByIdAndUpdate(blogId, {
        title,
        body,
        tags,
    });
    res.status(200).json({ message: "blog updated successfully", blog });
});

const deleteBlog = asyncHandler(async (req, res, next) => {
    const blogId = req.params.blogId;
    const userId = req.user;
    const existBlog = await blogModel.findById(blogId);
    if (!existBlog) {
        return next(new Error("No blog found with this Id!", { cause: 400 }));
    }
    if (existBlog.author != userId) {
        return next(new Error("you can only delete your blog", { cause: 400 }));
    }
    const blog = await blogModel.findByIdAndDelete(blogId);
    res.status(200).json({ message: "blog deleted successfully", blog });
});

const searchBlog = asyncHandler(async (req, res, next) => {
    const { search } = req.body;

    if (!search) {
        return next(new Error("search value must not be empty!", { cause: 400 }));
    }

    let result;
    const user = await userModel.findOne({
        userName: { $regex: search, $options: "i" },
    });

    if (!user) {
        result = await blogModel.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } },
            ],
        });
    } else {
        result = await blogModel.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } },
                { author: user._id },
            ],
        });
    }
    if (!result || result.length == 0) {
        return res.status(404).json({ message: "no results found!" })
    }

    res.status(200).json({ message: "Done", result });
});
module.exports = {
    getBlog,
    getBlogByAuthor,
    addBlog,
    editBlog,
    deleteBlog,
    searchBlog,
    blogPhoto
   
  };