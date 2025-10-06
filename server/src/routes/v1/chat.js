import express from 'express';

import { 
  addMessage, 
  createChat, 
  deleteChat, 
  deleteMessage,
  generateImage,
  getChatById, 
  getChats, 
  renameChat,
  updateMessage,
  // If you also expose GET /:chatId/messages, import getMessages here
  // getMessages,
} from '../../controller/chatController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
// ⬇️ Import all needed Zod schemas
import { 
  addMessageSchema,
  deleteChatSchema,
  // for GET /:chatId we can reuse the same params schema as deleteChat
  deleteChatSchema as getChatByIdSchema,
  deleteMessageSchema,
  getChatsSchema,
  renameChatSchema,
  updateMessageSchema,
  // If you add GET /:chatId/messages, use:
  // getMessagesSchema,
} from '../../validators/chatSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

// ----- Chats -----
router.post('/',            isAuthenticated, createChat);
router.get('/',             isAuthenticated, validate(getChatsSchema),        getChats);
router.get('/:chatId',      isAuthenticated, validate(getChatByIdSchema),     getChatById);
router.patch('/:chatId',    isAuthenticated, validate(renameChatSchema),      renameChat);
router.delete('/:chatId',   isAuthenticated, validate(deleteChatSchema),      deleteChat);

// ----- Messages -----
router.post('/:chatId/messages',                          isAuthenticated, validate(addMessageSchema),       addMessage);
router.patch('/:chatId/messages/:messageId',              isAuthenticated, validate(updateMessageSchema),     updateMessage);
router.delete('/:chatId/messages/:messageId',             isAuthenticated, validate(deleteMessageSchema),     deleteMessage);

// <------------Images------------->
router.post('/:chatId/messages/image', isAuthenticated, generateImage);

// If you later expose GET /:chatId/messages:
// router.get('/:chatId/messages', isAuthenticated, validate(getMessagesSchema), getMessages);

export default router;
