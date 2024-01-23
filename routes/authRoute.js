const validation = require('../middleware/validation.js');
const authController = require('../controllers/allController.js');
const express = require('express');
const validators = require('../middleware/validation.js');
const auth = require('../middleware/auth.js');
const router = express.Router();


router.post('/signup',validation(validators.signup),authController.signup)
router.post('/login',validation(validators.login),authController.login)
router.put("/addFollower/:followingId",auth(),authController.addFollower);
router.put("/deleteFollower/:followingId",auth(),authController.deleteFollower);
router.get("/",auth(),authController.getAllUsers);
router.get("/:userId",auth(),authController.getOneUser);


export default router