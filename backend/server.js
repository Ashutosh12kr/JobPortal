const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const multer = require("multer");
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage: storage });

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");

const app = express();

app.use(cors());
app.use(express.json());

// Frontend folder ko serve karna
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
})
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:");
        console.log(error.message);
    });

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Register API
app.post("/register", async (req, res) => {

    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({
                message: "User already exists"
            });
        }

        // Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        });

        await user.save();

        res.json({
            message: "User registered successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }
});

// Login API
app.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                message: "User not found"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                message: "Invalid password"
            });
        }

        res.json({
            message: "Login successful",
            role: user.role,
            name: user.name
        });

    } catch (error) {

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }
});
// Update Profile
app.put("/update-profile/:email", async (req, res) => {

    try {

        const { name, email } = req.body;

        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            {
                name: name,
                email: email
            },
            { new: true }
        );

        if (!user) {
            return res.json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile updated successfully",
            user: user
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });

    }
});
// Post a new job
app.post("/jobs", async (req, res) => {

    try {

       const {
    title,
    company,
    location,
    description,
    salary,
    jobType,
    workMode
} = req.body;

       
           const job = new Job({

    title: title,
    company: company,
    location: location,
    description: description,
    salary: salary,
    jobType: jobType,
    workMode: workMode

});
        await job.save();

        res.json({
            message: "Job posted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to post job",
            error: error.message
        });

    }

});
// Get all jobs
app.get("/jobs", async (req, res) => {

    try {

        const jobs = await Job.find().sort({ createdAt: -1 });

        res.json(jobs);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch jobs"
        });

    }
});
// Save Job
app.put("/save-job/:email/:jobId", async (req, res) => {
    try {

        const user = await User.findOne({
            email: req.params.email
        });

        if (!user) {
            return res.json({
                message: "User not found"
            });
        }

        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.json({
                message: "Job not found"
            });
        }

        await User.findByIdAndUpdate(
            user._id,
            {
                $addToSet: {
                    savedJobs: job._id
                }
            }
        );

        res.json({
            message: "Job saved successfully"
        });

    } catch (error) {

        console.log("Save Job Error:", error.message);

        res.status(500).json({
            message: "Failed to save job",
            error: error.message
        });
    }
});
// Get Saved Jobs
app.get("/saved-jobs/:email", async (req, res) => {
    try {

        const user = await User.findOne({
            email: req.params.email
        }).populate("savedJobs");

        if (!user) {
            return res.json({
                message: "User not found"
            });
        }

        res.json(user.savedJobs);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to fetch saved jobs"
        });
    }
});
// Remove Saved Job
app.put("/remove-saved-job/:email/:jobId", async (req, res) => {
    try {

        const user = await User.findOne({
            email: req.params.email
        });

        if (!user) {
            return res.json({
                message: "User not found"
            });
        }

        user.savedJobs = user.savedJobs.filter(
            id => id.toString() !== req.params.jobId
        );

        await user.save();

        res.json({
            message: "Job removed from saved jobs"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to remove saved job"
        });
    }
});
// Apply for a job
app.post("/apply", async (req, res) => {

    try {

        const {
            jobId,
            jobTitle,
            applicantName,
            applicantEmail
        } = req.body;


        // Find the job
        const job = await Job.findById(jobId);

        if (!job) {

            return res.status(404).json({
                message: "Job not found"
            });

        }


        // Find applicant
        const user = await User.findOne({
            email: applicantEmail
        });

      if (!user || !user.resume) {

    return res.status(400).json({
        message: "Please upload your resume before applying."
    });

}
        // Use jobTitle from request,
        // otherwise use title from database
        const finalJobTitle = jobTitle || job.title;


        const application = new Application({

            jobId: jobId,

            jobTitle: finalJobTitle,

            applicantName: applicantName,

            applicantEmail: applicantEmail,

            resume: user ? user.resume : ""

        });


        await application.save();


        res.json({

            message: "Application submitted successfully"

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Application failed",

            error: error.message

        });

    }

});
// Get applications of a job seeker
app.get("/applications/:email", async (req, res) => {
    try {

        const applications = await Application.find({
            applicantEmail: req.params.email
        }).sort({ appliedAt: -1 });

        res.json(applications);

    } catch (error) {

        console.log("Applications Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch applications"
        });
    }
});

// Get all job applications
app.get("/all-applications", async (req, res) => {

    try {

        const applications = await Application.find()
            .sort({ appliedAt: -1 });

        res.json(applications);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message
        });

    }

});
// Update application status
app.put("/application-status/:id", async (req, res) => {
    try {

        const { status } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            },
            {
                new: true
            }
        );

        if (!application) {
            return res.json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application status updated successfully",
            application: application
        });

    } catch (error) {

        console.log("Status Error:", error.message);

        res.status(500).json({
            message: "Failed to update application status",
            error: error.message
        });
    }
});
app.post("/upload-resume", upload.single("resume"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume"
            });
        }

        const email = req.body.email;

        if (!email) {
            return res.status(400).json({
                message: "User email is required"
            });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.resume = req.file.filename;

        await user.save();

        res.json({
            message: "Resume uploaded successfully",
            file: req.file.filename
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });

    }

});
app.get("/profile/:email", async (req, res) => {

    try {

        const user = await User.findOne({
            email: req.params.email
        }).select("name email role resume");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });

    }

});
// Delete an application

app.delete("/delete-application/:id", async (req, res) => {

    try {

        const application = await Application.findByIdAndDelete(
            req.params.id
        );

        if (!application) {

            return res.status(404).json({
                message: "Application not found"
            });

        }

        res.json({
            message: "Application deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete application"
        });

    }

});
app.delete("/jobs/:id", async (req, res) => {

    try {

        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json({
            message: "Job deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete job"
        });

    }

});
app.put("/jobs/:id", async (req, res) => {

    try {

        const {
            title,
            company,
            location,
            salary,
            description
        } = req.body;

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                company: company,
                location: location,
                salary: salary,
                description: description
            },
            { new: true }
        );

        if (!job) {

            return res.status(404).json({
                message: "Job not found"
            });

        }

        res.json({
            message: "Job updated successfully",
            job: job
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to update job"
        });

    }

});
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});