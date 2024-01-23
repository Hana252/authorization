const joi = require('joi');
const Types = require('mongoose').Types;
const userModel = require("../models/appModel");
const { verifyToken, asyncHandler } = require("../controllers/allController");

const dataMethods = ["body", 'params', 'query', 'headers', 'file'];

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message('Invalid ID');
};

const generalFields = {
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 4,
    tlds: { allow: ['com', 'net'] }
  }).required(),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  cPassword: joi.string().required(),
  id: joi.string().custom(validateObjectId).required(),
  optionalId: joi.string().custom(validateObjectId),
  name: joi.string().required(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
    finalDest: joi.string().required(),
  })
};

const validation = (schema) => {
  return (req, res, next) => {
    const inputsData = { ...req.body, ...req.query, ...req.params };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files;
    }
    const validationResult = schema.validate(inputsData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res.status(400).json({ message: "validation error", validationErr: validationResult.error?.details });
    }
    return next();
  };
};

const roles={
  Admin:"Admin",
  User:"User",
  Manager:"Manager"
};
const auth =(accessRoles=[roles.User,roles.Admin])=>{ 
  return asyncHandler(async(req, res, next) => {
   
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("In-valid bearer key", {cause:400}));
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(new Error("In-valid token", {cause:400}));
    }
    const decoded = verifyToken({token});
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", {cause:400}));
    }
    const user = await userModel.findById(decoded.id).select('userName image role changePasswordTime');
    if (!user) {
      return next(new Error("Not register account", {cause:401}));
    }
    if(parseInt(user.changePasswordTime?.getTime() /1000) > decoded.iat){
      return next(new Error("expired token", {cause:400}));
    }
     
    if(!accessRoles.includes(user.role)){
      return next(new Error("Not authorized user", {cause:403}));
    }
    req.user = decoded.id;
    return next();
  });
};

module.exports = {
  dataMethods,
  generalFields,
  roles,
  auth,
  validation
};