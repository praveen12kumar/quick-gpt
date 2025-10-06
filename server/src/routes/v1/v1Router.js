import express from 'express';

import chatRouter from './chat.js';
import userRouter from './users.js';
const router = express.Router();

router.use('/users', userRouter);
router.use('/chats', chatRouter);



export default router;
