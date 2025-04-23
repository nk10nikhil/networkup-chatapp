import { Schema, model, models } from 'mongoose';

const ChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: {
            type: String,
            default: ''
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure chat between two users is unique
ChatSchema.index({ participants: 1 }, { unique: true });

export default models.Chat || model('Chat', ChatSchema);