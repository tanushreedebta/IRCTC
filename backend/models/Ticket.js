const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    trainName: String,
    trainNumber: String,
    from: String,
    to: String,
    journeyDate: Date,
    passengerName: String,
    price: Number,
    ticketImage: String,
    status: {
        type: String,
        default: "Available"
    }
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);