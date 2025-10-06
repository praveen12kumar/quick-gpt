import Chat from "../schema/chatSchema.js";
import crudRepository from "./crudRepository.js";

const chatRepository = {
    ...crudRepository(Chat),


    // Get all chats for a user (paginated)

    findAllByUser: async function(userId, {limit = 20, skip = 0, projection = 'name createdAt updatedAt'} = {}){
        return Chat.find({userId})
        .select(projection)
        .limit(limit)
        .skip(skip)
        .sort({updatedAt: -1})
        .lean();
    }, 

    // find a chat by id for a user

    findOneByIdForUser: async function(chatId, userId){
        return Chat.findOne({_id: chatId, userId});
    },

    // rename a chat

    rename: async function (chatId, userId, name) {
        return Chat.findByIdAndUpdate(
            { _id: chatId, userId},
            {$set: {name}},
            { new: true}
            )
    },

    // delete a chat

    deleteOneForUser: async function(chatId, userId){
        return Chat.findByIdAndDelete({_id: chatId, userId});
    },

    // Update a message by Message Id

    appendMessage: async function(chatId, userId, {isImage = false, role = 'user', content, isPublished = false}){
        const now = new Date();
        return Chat.findByIdAndUpdate(
            {_id: chatId, userId},
            {
                $push:{
                    message:{
                        isImage,
                        role,
                        content,
                        isPublished,
                        updatedAt: now,
                    }
                },
                $set:{
                    updatedAt: now,
                },
            },
            {
                new: true,
            },
        );
    },

    async updateMessage(chatId, userId, messageId, data) {
    const allowed = ["isImage", "role", "content", "isPublished"];
    const payload = {};
    for (const k of allowed) if (k in data) payload[`message.$[m].${k}`] = data[k];
    payload["message.$[m].updatedAt"] = new Date();
    return Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: payload },
      {
        arrayFilters: [{ "m._id": messageId }],
        new: true,
      }
    );
  },
    


    // Delete a single message from a chat
    deleteMessage: async function(chatId, userId, messageId){
        return Chat.findOneAndUpdate(
            {_id: chatId, userId},
            {
                $pull:{
                    message:{
                        _id: messageId
                    }
                }
            },
            {new : true}
        );
    }
};


export default chatRepository;
