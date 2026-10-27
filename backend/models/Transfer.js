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


    // Municipality keys (see data/municipalities.js) — arnona is closed at
    // the old city and opened at the new one.
    oldCity: {
        type: String,
        default: ""
    },

    newCity: {
        type: String,
        default: ""
    },


    // The person moving out. Kept on the transfer (not the User) because
    // utility companies need it per request, and it may differ from the
    // account holder (e.g. a spouse fills it in).
    applicant: {
        name: String,
        idNumber: String,
        phone: String,
        email: String
    },


    // Stored in MongoDB (private_uploads bucket) with a random name; leaseFileName is the
    // user's original name, used for downloads and email attachments.
    leaseFile: {
        type: String,
        default: ""
    },

    leaseFileName: {
        type: String,
        default: ""
    },

    // When the applicant ticked "send letters on my behalf / accept the
    // terms" (v2 frontend). Letters to municipalities rely on it.
    consentAt: {
        type: Date,
        default: null
    },

    // "Do it for me" paperwork, given once per transfer: an ID copy and the
    // user's signature on the power of attorney (both in private_uploads).
    // authorizedAt is when they signed.
    idFile: {
        type: String,
        default: ""
    },

    idFileName: {
        type: String,
        default: ""
    },

    signatureFile: {
        type: String,
        default: ""
    },

    authorizedAt: {
        type: Date,
        default: null
    },

    // Site language at the last "do it for me" request — status emails to
    // the user go out in it.
    lang: {
        type: String,
        default: ""
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

            meterReading: {
                type: String,
                default: ""
            },

            // The user's number with that provider (IEC contract, water
            // consumer, arnona property…), from their last bill. Optional.
            accountNumber: {
                type: String,
                default: ""
            },

            // Company key where the user picks one (gas: amisragas, supergas…).
            provider: {
                type: String,
                default: ""
            },

            // How the request actually went out: "email", "auto" (online
            // form) or "manual" (we only marked it — the user still has to
            // contact the provider).
            sentVia: {
                type: String,
                default: ""
            },

            requestSentAt: {
                type: Date,
                default: null
            },

            // "Do it for me": the user asked MoveMate staff to contact the
            // provider on their behalf (sentVia "concierge"). conciergeNote
            // is what staff tell the user back (a reference number, or why
            // it failed).
            conciergeRequestedAt: {
                type: Date,
                default: null
            },

            conciergeNote: {
                type: String,
                default: ""
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