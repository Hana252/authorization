const joi = require('joi');
const Types = require('mongoose').Types;

const dataMethods = ["body", 'params', 'query', 'headers', 'file'];

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId');
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
module.exports = {
    validateObjectId,
    validation,
    generalFields
  };