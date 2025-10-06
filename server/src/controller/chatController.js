import { StatusCodes } from "http-status-codes";

import {             addMessageService,
createChatService, 
            deleteChatService, 
            deleteMessageService,
            generateImageService,
            getChatByIdService, 
            getChatsService, 
            renameChatService, 
            updateMessageService,
        } from "../services/chatService.js";
import { customErrorResponse, internalErrorResponse, successResponse } from "../utils/common/responseObject.js";



export const createChat = async(req, res)=>{
    try{
        const response = await createChatService(req.user.id);
        return res.status(StatusCodes.CREATED).json(successResponse(response, "Chat created successfully"));
    }
    catch(error){
        console.log("user Controller get chats error", error);
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }   
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}


// get All Chats of a user

export const getChats = async(req, res)=>{
    try {
        const {limit, skip} = req.query;
        const response = await getChatsService(req.user.id,{
            limit: Number(limit) || 20,
            skip: Number(skip) || 0,
        });
        return res.status(StatusCodes.OK).json(successResponse(response, "Chats found successfully"));
    } catch (error) {
        console.log("user Controller get chats error", error);
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }   
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}


// get a chat of a user by id

export const getChatById = async(req, res)=>{
    try {
        const response = await getChatByIdService(req.user.id, req.params.chatId);
        return res.status(StatusCodes.OK).json(successResponse(response, "Chat found successfully"));
    } catch (error) {
        console.log("user Controller get chats error", error);
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }   
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};


// rename a chat

export const renameChat = async(req, res)=>{
    try {
        const response = await renameChatService(req.user.id, req.params.chatId, req.body.name);
        return res.status(StatusCodes.OK).json(successResponse(response, "Chat renamed successfully"));
    } catch (error) {
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};


// delete chat by id

export const deleteChat = async(req, res)=>{
    try {
        const response = await deleteChatService(req.user.id, req.params.chatId);
        return res.status(StatusCodes.OK).json(successResponse(response, "Chat deleted successfully"));
    } catch (error) {
        console.log("user Controller get user error", error);
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }   
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}

// add message 
export const addMessage = async(req, res)=>{
    try {
        const response = await addMessageService(req.user.id, req.params.chatId, req.body);
        return res.status(StatusCodes.OK).json(successResponse(response, "Message added successfully"));
    } catch (error) {
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};


export const updateMessage = async(req, res)=>{
    try {
        const response = await updateMessageService(
            req.user.id,
            req.params.chatId,
            req.params.messageId,
            req.body
        )
        return res.status(StatusCodes.OK).json(successResponse(response, "Message updated successfully"));
    } catch (error) {
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}

// generate Image
export const generateImage = async(req, res)=>{
    console.log("req.body", req.body);
    console.log("req.params", req.params);
    console.log("req.user", req.user);
    try {
        const response = await generateImageService(req.user.id, req.params.chatId, req.body);
        return res.status(StatusCodes.OK).json(successResponse(response, "Image generated successfully"));
    } catch (error) {
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}


export const deleteMessage = async(req, res)=>{
    try {
        const response = await deleteMessageService(req.user.id, req.params.chatId, req.params.messageId);
        return res.status(StatusCodes.OK).json(successResponse(response, "Message deleted successfully"));
    } catch (error) {
        if(error.statusCode){
            return res.status(error.statusCode).json(customErrorResponse(error));
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
}