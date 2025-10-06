import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName:{
        type: String,
        required: true,
    },
    name:{                         // chat name
        type: String,
        required: true,
    },
    message:[
        {
            isImage: { type: Boolean, required: true },
            isPublished: { type: Boolean, default: false },
            role: { type: String, enum: ["user", "assistant", "system"], required: true, default: "user"},
            content: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now },
            },
        { _id: true }
    ],
},{
    timestamps: true,
});



const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

