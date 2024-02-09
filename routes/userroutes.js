import express, { Router } from 'express';
import UserController from '../controllers/userController.js';
import checkUserSAuth from '../middlewares/auth-middleware.js';
const router = express.Router();

/// Route level middleware- to protect route
router.use('/changepassword', checkUserSAuth)
router.use('/loggeduser', checkUserSAuth)

router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)

router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser' , UserController.loggedUser)

export default router;