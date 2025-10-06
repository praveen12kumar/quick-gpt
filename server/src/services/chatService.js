import  { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import imagekit from "../config/imagekitConfig.js";
import openai from "../config/openAIConfig.js";
import chatRepository from "../repository/chatRepository.js";
import userRepository from "../repository/userRepository.js";
import ClientError from "../utils/errors/clientError.js";
import { ValidationError } from "../utils/errors/validationError.js";



async function ensureUser(userId, minCredits = 1){
    const user = await userRepository.getById(userId);
    
    if(!user){
        throw new ClientError({
            message: "User not found",
            statusCode: StatusCodes.NOT_FOUND,
            explanation: ["Invalid chat/message sent from the client"],
        })
    };
    if((user.credits ?? 0) < minCredits){
        throw new ClientError({
            message: "Insufficient credits",
            statusCode: StatusCodes.PAYMENT_REQUIRED,
            explanation: ["Insufficient credits"],
        })
    }
    return user;
};


export const createChatService = async(userId)=>{
    try {
        
        const user = await ensureUser(userId);
        
        const chat = await chatRepository.create({
            userId: user._id,
            userName: user.username,
            name: "New Chat",
            message: [],
        });

        return chat;
    } catch (error) {
        console.log('Chat Service error', error);
        if (error.name === "ValidationError") {
            throw new ValidationError({ error: error.errors },error.message);
        }
        throw error;
    }
}

// get all chats of a user

export const getChatsService = async(userId, opts) =>{
    try {
        
        await ensureUser(userId);

        const chats = await chatRepository.findAllByUser(userId, opts);
        return chats;

    } catch (error) {
        console.log('Chat Service error', error);
        if (error.name === "ValidationError") {
            throw new ValidationError({ error: error.errors },error.message);
        }
        throw error;
    }
}

// get a chat of a user by id

export const getChatByIdService = async(userId, chatId)=>{
    try {
       
        await ensureUser(userId);

        const chat = await chatRepository.findOneByIdForUser(chatId, userId);

        if(!chat){
            throw new ClientError({
                message: "Chat not found",
                statusCode: StatusCodes.NOT_FOUND,
                explanation: ["Invalid chat/message sent from the client"],
            })
        }
        return chat;

    } catch (error) {
        console.log('Chat Service error', error);
        if (error.name === "ValidationError") {
            throw new ValidationError({ error: error.errors },error.message);
        }
        throw error;
    }
}

// rename a chat service

export const renameChatService = async(userId, chatId, name)=>{
    try {
        await ensureUser(userId);
        const chat = await chatRepository.rename(chatId, userId, name.trim());
        if(!chat){
            throw new ClientError({
                message: "Chat not found",
                statusCode: StatusCodes.NOT_FOUND,
                explanation: ["Invalid chat/message sent from the client"],
            })
        }
        return chat;
    } catch (error) {
        if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors }, error.message);
    }
    throw error;
    }
}


export const deleteChatService = async(userId, chatId) =>{
    try {
        
        await ensureUser(userId);

        const deletedChat = await chatRepository.deleteOneForUser(chatId, userId);
        //console.log("chat", chat);
        if(!deletedChat){
            throw new ClientError({
                message: "Chat not found",
                statusCode: StatusCodes.NOT_FOUND,
                explanation: ["Invalid chat/message sent from the client"],
            })
        }
        return deletedChat;

    } catch (error) {
        console.log('Chat Service error', error);
        if (error.name === "ValidationError") {
            throw new ValidationError({ error: error.errors },error.message);
        }
        throw error;
    }
}

// append a message to a chat




export const addMessageService = async (userId, chatId, payload) => {
  try {
    const { role, content, isImage = false} = payload || {};
    
    if (!role || !content) {
      throw new ClientError({
        message: "Invalid payload",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["role and content are required"],
      });
    }
    if (isImage) {
      throw new ClientError({
        message: "Use the image message endpoint",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["This API handles text messages only"],
      });
    }

    // 1) Pre-check user and credits (fast-fail before paying LLM)
    await ensureUser(userId);

    // 2) Ensure chat ownership + build history (existing + new user message)
    const chat = await chatRepository.findOneByIdForUser(chatId, userId);
    
    if (!chat) {
      throw new ClientError({
        message: "Chat not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid chat id or not owned by user"],
      });
    }
    const history = (chat.message || []).map(m => ({
      role: m.role,            // "system" | "user" | "assistant"
      content: m.content,
    }));
    history.push({ role, content });
    //console.log("history", history);
    // 3) Call model (outside transaction to keep tx short)
    const completion = await openai.chat.completions.create({
      model: process.env.CHAT_MODEL,
      messages: [{ role: "system", content: process.env.SYSTEM_PROMPT }, ...history],
      temperature: 0.7,
    });

    //console.log("completion", completion);

    const assistantText = completion?.choices?.[0]?.message?.content?.trim?.() || "";
    if (!assistantText) {
      throw new ClientError({
        message: "No reply from model",
        statusCode: StatusCodes.BAD_GATEWAY,
        explanation: ["Model returned no content"],
      });
    }

    //console.log("assistantText", assistantText);
    // Prepare message docs in schema shape
    const userMsgDoc = {
      isImage: false,
      isPublished: true, // you can decide per UI
      role,              // "user"
      content,
      updatedAt: new Date(),
    };
    const assistantMsgDoc = {
      isImage: false,
      isPublished: true,
      role: "assistant",
      content: assistantText,
      updatedAt: new Date(),
    };

    // 4) Transaction: append both messages + decrement 1 credit atomically
    const session = await mongoose.startSession();

    let updatedChat;
    try {
      await session.withTransaction(async () => {
        // Append both messages (single write)
        updatedChat = await chatRepository.update(
          { _id: chatId, userId },
          {
            $push: { message: { $each: [userMsgDoc, assistantMsgDoc] } },
            $set: { updatedAt: new Date() },
          },
          { new: true, session }
        );
        if (!updatedChat) {
          throw new ClientError({
            message: "Chat not found during update",
            statusCode: StatusCodes.NOT_FOUND,
            explanation: ["Chat may have been deleted"],
          });
        }

        // Decrement 1 credit with guard (prevents race / negative credits)
        const creditRes = await userRepository.update(
          { _id: userId, credits: { $gte: 1 } },
          { $inc: { credits: -1 } },
          { new: true, session }
        );
        if (!creditRes) {
          // This aborts the tx and nothing is written
          throw new ClientError({
            message: "Insufficient credits",
            statusCode: StatusCodes.PAYMENT_REQUIRED,
            explanation: ["Credits changed during processing"],
          });
        }
      });
    } finally {
      session.endSession();
    }

    return {
      reply: assistantText,
      chat: updatedChat,
    };
  } catch (error) {
    console.log("Chat Service error", error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors }, error.message);
    }
    throw error;
  }
};




export const updateMessageService = async(userId, chatId, messageId, {content, regenerate = true})=>{
    try {
    // If no regeneration requested, you can do a simple targeted update and return.
    // (Here we default to regenerate=true behavior per your requirement.)
    if (!regenerate) {
      // simple in-place update (no credit charge, no model call)
      const chat = await chatRepository.updateMessage(chatId, userId, messageId, {
        content,
        updatedAt: new Date(),
      });
      if (!chat) {
        throw new ClientError({
          message: "Chat not found",
          statusCode: StatusCodes.NOT_FOUND,
          explanation: ["Invalid chat/message sent from the client"],
        });
      }
      return { chat, reply: null };
    }

    // Need credits for regeneration
    await ensureUser(userId);

    // Load full chat to locate message index and build the new history
    const chatDoc = await chatRepository.findOneByIdForUser(chatId, userId);
    if (!chatDoc) {
      throw new ClientError({
        message: "Chat not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid chat id or not owned by user"],
      });
    }

    const msgs = chatDoc.message || [];
    const idx = msgs.findIndex((m) => String(m._id) === String(messageId));
    if (idx === -1) {
      throw new ClientError({
        message: "Message not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid message id"],
      });
    }

    if (msgs[idx].role !== "user") {
      throw new ClientError({
        message: "Only user messages can be edited for regeneration",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["Target message is not a user message"],
      });
    }

    // Build history up to the edited message (inclusive), with the edited content applied.
    const editedUserMessage = {
      role: "user",
      content: content ?? msgs[idx].content,
    };

    // Everything BEFORE idx stays as-is
    const historyBefore = msgs.slice(0, idx).map((m) => ({ role: m.role, content: m.content }));

    // Compose new history fed to the model
    const history = [...historyBefore, editedUserMessage];

    // Call model outside the transaction
    const completion = await openai.chat.completions.create({
      model: process.env.CHAT_MODEL,
      messages: [{ role: "system", content: process.env.SYSTEM_PROMPT }, ...history],
      temperature: 0.7,
    });

    const assistantText = completion?.choices?.[0]?.message?.content?.trim?.() || "";
    if (!assistantText) {
      throw new ClientError({
        message: "No reply from model",
        statusCode: StatusCodes.BAD_GATEWAY,
        explanation: ["Model returned no content"],
      });
    }

    // Rebuild the new message array for the chat:
    // - take messages BEFORE idx
    // - put the EDITED user message at idx
    // - DROP everything after idx (rewind)
    // - APPEND new assistant message
    const now = new Date();
    const newUserMsgDoc = {
      ...msgs[idx].toObject?.() ?? msgs[idx],
      isImage: false,
      isPublished: true,
      role: "user",
      content: editedUserMessage.content,
      updatedAt: now,
    };
    const newAssistantMsgDoc = {
      isImage: false,
      isPublished: true,
      role: "assistant",
      content: assistantText,
      updatedAt: now,
    };

    const newMessages = [
      ...msgs.slice(0, idx), // before edited one
      newUserMsgDoc,
      newAssistantMsgDoc,
    ];

    // Atomic transaction: set entire message array + decrement credit
    const session = await mongoose.startSession();
    let updatedChat;
    try {
      await session.withTransaction(async () => {
        updatedChat = await chatRepository.update(
          { _id: chatId, userId },
          {
            $set: { message: newMessages, updatedAt: new Date() },
          },
          { new: true, session }
        );
        if (!updatedChat) {
          throw new ClientError({
            message: "Chat not found during update",
            statusCode: StatusCodes.NOT_FOUND,
            explanation: ["Chat may have been deleted or not owned by user"],
          });
        }

        const creditRes = await userRepository.update(
          { _id: userId, credits: { $gte: 1 } },
          { $inc: { credits: -1 } },
          { new: true, session }
        );
        if (!creditRes) {
          throw new ClientError({
            message: "Insufficient credits",
            statusCode: StatusCodes.PAYMENT_REQUIRED,
            explanation: ["Credits changed during processing"],
          });
        }
      });
    } finally {
      session.endSession();
    }

    return { reply: assistantText, chat: updatedChat };
  } catch (error) {
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors }, error.message);
    }
    throw error;
  }
}


// generate image service
export const generateImageService = async(userId, chatId, payload )=>{
  try {
    const {content, n=1, size = "1024x1024"} = payload || {};

    if (!content || typeof content !== "string") {
      throw new ClientError({
        message: "Invalid payload",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["role and content are required"],
      });
    }

    if(n < 1 || n > 4){
      throw new ClientError({
        message: "Invalid number of images",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["n must be between 1 and 4"],
      })
    }
    await ensureUser(userId);
    const chat = await chatRepository.findOneByIdForUser(chatId, userId);
    
    if (!chat) {
      throw new ClientError({
        message: "Chat not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid chat id or not owned by user"],
      });
    }


  const imageResponse = await openai.images.generate(
    {
      model: process.env.IMAGE_MODEL,
      prompt:content,
      n,
      size,
      response_format: "b64_json",
    });

    const b64List = (imageResponse.data || []).map((image) => image.b64_json).filter(Boolean);
  
    if(!b64List.length){
      throw new ClientError({
        message: "No images generated",
        statusCode: StatusCodes.BAD_GATEWAY,
        explanation: ["Model returned no image Data"],
      });
    }

    const upload = await Promise.all(
      b64List.map((b64, i)=>{
        return imagekit.upload({
          file: b64,
          fileName: `chat-${chatId}-${Date.now()}-image-${i}.png`,
          folder: "/quickGPT",
          useUniqueFileName: true
        })
      })
    );

    const imageUrls = upload.map((u) => u.url);

    // Build assisant image message(s)

    const now = new Date();
    const newMsgs = imageUrls.map((url) => ({
      isImage: true,
      isPublished: true,
      role: "assistant",
      content: url,
      updatedAt: now,
    }));

    // Atomic transaction: set entire message array + decrement credit
    const session = await mongoose.startSession();
    let updatedChat;
    try {
      await session.withTransaction(async () => {
        updatedChat = await chatRepository.update(
          { _id: chatId, userId },
          { $push: { message: { $each: newMsgs } }, $set: { updatedAt: new Date() } },
          { new: true, session }
        );
        if (!updatedChat) {
          throw new ClientError({
            message: "Chat not found during update",
            statusCode: StatusCodes.NOT_FOUND,
            explanation: ["Chat may have been deleted"],
          });
        }

        const creditRes = await userRepository.update(
          { _id: userId, credits: { $gte: 1 } },
          { $inc: { credits: -1 } }, // or -n if you want per-image billing
          { new: true, session }
        );
        if (!creditRes) {
          throw new ClientError({
            message: "Insufficient credits",
            statusCode: StatusCodes.PAYMENT_REQUIRED,
            explanation: ["Credits changed during processing"],
          });
        }
      });
    } finally {
      session.endSession();
    }
    return { imageUrls, chat: updatedChat };

  } catch (error) {
    console.log("Image generation error:", error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors }, error.message);
    }
    throw error;
  }
}











// delete a message from a chat

export const deleteMessageService = async(userId, chatId, messageId)=>{
    try {
        await ensureUser(userId);
        const chat = await chatRepository.deleteMessage(chatId, userId, messageId);
        if(!chat){
            throw new ClientError({
                message: "Chat not found",
                statusCode: StatusCodes.NOT_FOUND,
                explanation: ["Invalid chat/message sent from the client"],
            })
        }
        return chat;
    } catch (error) {
        console.log('Chat Service error', error);
        if (error.name === "ValidationError") {
            throw new ValidationError({ error: error.errors },error.message);
        }
        throw error;
    }
}