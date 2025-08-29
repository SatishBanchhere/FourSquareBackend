import mongoose from 'mongoose'
import { Connection, Schema } from 'mongoose';

const chatSchema = new mongoose.Schema({
    name: {type: String, required: true},
    profilePic: {type: String, required: false, default: null},
    message: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    eventId: {type: Schema.Types.ObjectId, ref: 'Events'},
}, { strict: "throw" });;

const eventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false, default: ""},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    placeId: {type: Schema.Types.ObjectId, ref: 'Places'},
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chats' }],
}, { strict: "throw" });

const placeSchema = new mongoose.Schema({
    fsq_place_id: {type: String, required: true, unique: true, index: true},
    events: [{ type: Schema.Types.ObjectId, ref: 'Events' }],
}, {
    timestamps: true,
    strict: "throw"
});

export function getModels(connection:Connection) {
    const Chats = connection.models.Chats || connection.model('Chats', chatSchema);
    const Events = connection.models.Events || connection.model('Events', eventSchema);
    const Places = connection.models.Places || connection.model('Places', placeSchema);

    return { Chats, Events, Places };
}