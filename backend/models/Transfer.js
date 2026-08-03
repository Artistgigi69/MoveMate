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
            },

            meterPhoto: {
                type: String,
                default: ""
            },

            requestSentAt: {
                type: Date,
                default: null
            },

            // Lets the new tenant confirm the meter reading from a link,
            // with no login required.
            confirmToken: {
                type: String,
                default: ""
            },

            confirmedByTenant: {
                type: Boolean,
                default: false
            },

            confirmedAt: {
                type: Date,
                default: null
            }
        }
    ],


    newTenant: {
        name: String,
        phone: String,
        email: String,
        idNumber: String
    },


    createdAt: {
        type: Date,
        default: Date.now
    },


    reminderSent: {
        type: Boolean,
        default: false
    }

});


module.exports = mongoose.model(
    "Transfer",
    transferSchema
);