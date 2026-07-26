const mongoose = require("mongoose");


const transferSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    oldAddress: {
        type: String,
        required: true
    },


    newAddress: {
        type: String,
        required: true
    },


    moveDate: {
        type: String,
        required: true
    },


    services: [
        {
            name: String,

            status: {
                type: String,
                default: "Pending"
            }
        }
    ],


    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "Transfer",
    transferSchema
);