const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const { nanoid } = require("nanoid");
const fs = require('fs');
const path = require("path");
// const { fileURLToPath } = require("url");
// const __dirname= fileURLToPath(import.meta.url);



const hash = ({ plaintext, salt = process.env.SALT_ROUND } = {}) => {
 const hashResult = bcrypt.hashSync(plaintext, parseInt(salt));
 return hashResult;
}

const compare = ({ plaintext, hashValue } = {}) => {
 const match = bcrypt.compareSync(plaintext, hashValue);
 return match;
}


const generateToken = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, expiresIn = 60 * 60 } = {}) => {
 const token = jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn) });
 return token;
}

const verifyToken = ({ token, signature = process.env.TOKEN_SIGNATURE } = {}) => {
 const decoded = jwt.verify(token, signature);
 return decoded;
}


const asyncHandler = (fn) => {
    return (req, res, next) => {
      return fn(req, res, next).catch(error => {
        return next(new Error(error, { cause: 500 }))
      })
    }
   }
   
   const globalErrorHandling = (error, req, res, next) => {
    if(process.env.MOOD=="dev"){
    return res.status(error.cause || 400).json({ msgError: error.message,error , stack: error.stack })
   }else{
    return res.status(error.cause || 400).json({ msgError: error.message })
   }
   }

   const fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    file: ["", ""],
    video: ["video/mp4"],
   };
   
   function fileUpload(customPath = "general",customValidation = []) {
    const fullPath = path.join(__dirname,'..','..','src','uploads',`${customPath}`);
    if(!fs.existsSync(fullPath)){
    fs.mkdirSync(fullPath,{recursive:true});
    }
    const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, fullPath);
    },
    filename: (req, file, callback) => {
     const fullName = Date.now() + "-"+nanoid()+ Math.round(Math.random() * 1e9)+file.originalname;
     file.finalDest =`uploads/${customPath}/${fullName}`;
     callback(null,fullName);
    },
    });
    function fileFilter(req, file, callback) {
    if (customValidation.includes(file.mimetype)) {
        callback(null, true);
    } else {
     cb("In-valid file format", false);
    }
    }
    const upload = multer({ storage, fileFilter });
    return upload;
   }
   
   module.exports = { hash, compare, generateToken, verifyToken, asyncHandler, globalErrorHandling, fileValidation, fileUpload  };
