//my schema
const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { Schema, Types, model } = require("mongoose");
const userSchema = new Schema({

 firstName:String,
 lastName:String,
 userName: {
   type: String,
   required: true,
   min: 2,
   max: 20

 },
 email: {
   type: String,
   required:true,
   unique: true
 },
 password: {
   type: String,
   required: true,
 },
  
 role: {
   type: String,
   default: 'User',
   enum: ['User', 'Admin','Manager']
 },

 status: {
   type: String,
   default:'offline' ,
   enum :['offline','blocked','online']
 },
 confirmEmail: {
   type: Boolean,
   default: false,
 },
 gender:{
   type:String,
   default:'male' ,
   enum :['male','female']
 },
 following:{
   type:[{
    type: mongoose.Schema.Types.ObjectId, 
    ref:"User"
}]
 },
 followers:{
   type:[{
    type: mongoose.Schema.Types.ObjectId, 
    ref:"User"
}]
 }

}, {
 timestamps: true
})

const blogSchema = new Schema(
 {
 title: {
  type: String,
  required: true,
 },
 body: {
  type: String,
 },
 urlToUpdate: String,
 photo: String,
 author: { 
    type: Types.ObjectId, 
    ref: "User" 
},
 tags: {
  type: [String],
  required: true
 }
},
{
 timestamps: true,
}
);

blogSchema.post("init", function (doc) {
 doc.photo = "http://localhost:3000/" + doc.photo;
});
const User =mongoose.models.User || model('User', userSchema)
const Blog = mongoose.models.Blog || model("Blog", blogSchema);
User.createIndexes({username:1})
Blog.createIndexes({
    title:1,
    author: 1,
    tags: 1,
})
module.exports = {
    User,
    Blog,
};



