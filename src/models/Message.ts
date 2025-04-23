import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content cannot be empty']
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for more efficient queries
MessageSchema.index({ chatId: 1, createdAt: -1 });

export default models.Message || model('Message', MessageSchema);