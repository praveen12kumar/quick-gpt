import express from 'express';

import { changePassword,forgotPassword, getUser, resetPassword, signin, signup, verifyEmail, verifyOtp } from '../../controller/userController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, userSignInSchema,userSignUpSchema, verifyOtpSchema, verifyUserSchema } from '../../validators/userSchema.js';
import { validate } from '../../validators/zodValidators.js';


const router = express.Router();

router.post('/signup', validate(userSignUpSchema), signup);

router.post('/verify-email', validate(verifyUserSchema), verifyEmail);

router.post('/signin', validate(userSignInSchema), signin);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp );

router.post('/change-password', validate(changePasswordSchema), changePassword);

router.post('/reset-password', isAuthenticated, validate(resetPasswordSchema), resetPassword);

router.get('/user', isAuthenticated, getUser);


export default router;
