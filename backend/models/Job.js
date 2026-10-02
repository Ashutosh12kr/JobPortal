const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    company: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    jobType: {
    type: String,
    default: "Full-time"
},

workMode: {
    type: String,
    default: "On-site"
},

    salary: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;