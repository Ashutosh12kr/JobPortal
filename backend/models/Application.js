const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    jobTitle: {
        type: String,
        required: true
    },

    applicantName: {
        type: String,
        required: true
    },

    applicantEmail: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "Applied"
    },
    resume: {
    type: String,
    default: ""
},

    appliedAt: {
        type: Date,
        default: Date.now
    }
});

const Application = mongoose.model(
    "Application",
    applicationSchema
);

module.exports = Application;