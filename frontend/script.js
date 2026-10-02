const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "";
async function registerUser() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password || !role) {
        document.getElementById("message").innerText =
            "Please fill all fields";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        document.getElementById("message").innerText = data.message;

    } catch (error) {

        document.getElementById("message").innerText =
            "Something went wrong";

        console.log(error);
    }
}

async function loginUser() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {

        document.getElementById("loginMessage").innerText =
            "Please fill all fields";

        return;
    }


    try {
    

        const response = await fetch(`${API_URL}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        document.getElementById("loginMessage").innerText =
            data.message;

       if (data.message === "Login successful") {

    localStorage.setItem("userName", data.name);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("userEmail", email);

   if (data.role === "Recruiter") {
    window.location.href = "recruiter.html";
} else {
    window.location.href = "dashboard.html";
}
}
    
    } catch (error) {

        document.getElementById("loginMessage").innerText =
            "Something went wrong";

        console.log(error);
    }
}
  async function loadJobs() {

    const email = localStorage.getItem("userEmail");

    // Login check
    if (!email) {

        alert("Please login first to view jobs.");

        window.location.href = "login.html";

        return;
    }


    try {

        const response = await fetch(
           `${API_URL}/jobs`
        );

        const jobs = await response.json();


        // Get filter values

        const jobType =
            document.getElementById("filterJobType").value;

        const workMode =
            document.getElementById("filterWorkMode").value;


        // Filter jobs

        const filteredJobs = jobs.filter(job => {

            const typeMatch =
                jobType === "" ||
                job.jobType === jobType;

            const modeMatch =
                workMode === "" ||
                job.workMode === workMode;

            return typeMatch && modeMatch;

        });


        const container =
            document.getElementById("jobsContainer");

        container.innerHTML = "";


        if (filteredJobs.length === 0) {

            container.innerHTML =
                "<p>No jobs found.</p>";

            return;
        }


        filteredJobs.forEach(job => {

            container.innerHTML += `

                <div class="job-card">

                    <h2>${job.title}</h2>

                    <h3>${job.company}</h3>

                    <p>📍 ${job.location}</p>

                    <p>💰 ${job.salary}</p>

                    <p>💼 ${job.jobType || "Full-time"}</p>

                    <p>🏠 ${job.workMode || "On-site"}</p>

                    <p>${job.description}</p>

                    <button
                        onclick="applyJob('${job._id}', '${job.title}')"
                    >
                        Apply Now
                    </button>

                    <button
                        onclick="saveJob('${job._id}')"
                    >
                        🔖 Save Job
                    </button>

                </div>

            `;

        });

    } catch (error) {

        console.log(error);

        document.getElementById("jobsContainer").innerHTML =
            "<p>Something went wrong.</p>";

    }

}
if (window.location.pathname.includes("jobs.html")) {
    loadJobs();
}
async function postJob() {

    const title =
        document.getElementById("jobTitle").value;

    const company =
        document.getElementById("company").value;

    const location =
        document.getElementById("location").value;

    const salary =
        document.getElementById("salary").value;

    const jobType =
        document.getElementById("jobType").value;

    const workMode =
        document.getElementById("workMode").value;

    const description =
        document.getElementById("description").value;


    try {

        const response = await fetch(
            `${API_URL}/jobs`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,
                    company: company,
                    location: location,
                    salary: salary,
                    jobType: jobType,
                    workMode: workMode,
                    description: description

                })
            }
        );


        const data = await response.json();

        alert(data.message);

        loadPostedJobs();

    } catch (error) {

        console.log("Post Job Error:", error);

        alert("Failed to post job");

    }

}

async function applyJob(jobId, jobTitle) {

    const applicantName = localStorage.getItem("userName");
    const applicantEmail = localStorage.getItem("userEmail");

    if (!applicantName || !applicantEmail) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/apply`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                jobId: jobId,
                jobTitle: jobTitle,
                applicantName: applicantName,
                applicantEmail: applicantEmail
            })
        });

        const data = await response.json();
        if (!response.ok) {

    alert(data.message);

    if (
        data.message ===
        "Please upload your resume before applying."
    ) {
        window.location.href = "resume.html";
    }

    return;
}


        alert(data.message);

    } catch (error) {

        console.log(error);
        alert("Something went wrong");

    }
}
async function loadApplications() {

    const email = localStorage.getItem("userEmail");

    if (!email) {
        document.getElementById("applicationsContainer").innerHTML =
            "<p>Please login first.</p>";
        return;
    }

    try {
const response = await fetch(
    `${API_URL}/applications/${encodeURIComponent(email)}`
);

const applications = await response.json();

        const container =
            document.getElementById("applicationsContainer");

        container.innerHTML = "";

        if (applications.length === 0) {
            container.innerHTML =
                "<p>You have not applied for any jobs yet.</p>";
            return;
        }

        applications.forEach(application => {

            container.innerHTML += `
                <div class="job-card">

                    <h2>${application.jobTitle}</h2>

                    <p>👤 Name: ${application.applicantName}</p>

                    <p>📧 Email: ${application.applicantEmail}</p>

                    <p>
                        📅 Applied On:
                        ${new Date(application.appliedAt)
                            .toLocaleDateString()}
                    </p>

                    <p>
                        📌 Status:
                        <strong>${application.status}</strong>
                    </p>

                </div>
            `;

        });

    } catch (error) {

        console.log("Application Error:", error);

        document.getElementById("applicationsContainer").innerHTML =
            "<p>Something went wrong.</p>";
    }
}


if (window.location.pathname.includes("my-applications.html")) {
    loadApplications();
}

async function loadRecruiterApplications() {

    try {

      const response = await fetch(
    `${API_URL}/all-applications`
);
        const applications = await response.json();

        const container =
            document.getElementById("recruiterApplications");

        container.innerHTML = "";

        if (applications.length === 0) {

            container.innerHTML =
                "<p>No applications received yet.</p>";

            return;
        }

        applications.forEach(application => {

            const card = document.createElement("div");

            card.className = "job-card";

            let resumeButton = "";

            if (application.resume) {

                resumeButton = `
                   <a
    href="${API_URL}/uploads/${application.resume}"
    target="_blank"
    class="resume-btn">

    👁️ View Resume
</a>
                `;

            } else {

                resumeButton = `
                    <p>No resume uploaded</p>
                `;

            }

            card.innerHTML = `

                <h2>${application.jobTitle}</h2>

                <p>
                    <strong>Applicant:</strong>
                    ${application.applicantName}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${application.applicantEmail}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${application.status}
                </p>

                ${resumeButton}

                <br><br>
              
<button
    class="shortlist-btn"
    onclick="updateApplicationStatus(
        '${application._id}',
        'Shortlisted'
    )"
>
    ✅ Shortlist
</button>

<button
    class="reject-btn"
    onclick="updateApplicationStatus(
        '${application._id}',
        'Rejected'
    )"
>
    ❌ Reject
</button>

<button
    class="delete-btn"
    onclick="deleteApplication('${application._id}')"
>
    🗑️ Delete Application
</button>

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.log(error);

        document.getElementById("recruiterApplications").innerHTML =
            "<p>Failed to load applications.</p>";

    }

}
async function deleteApplication(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

      const response = await fetch(
    `${API_URL}/delete-application/${id}`,
    {
        method: "DELETE"
    }
);

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            loadRecruiterApplications();

        }

    } catch (error) {

        console.log(error);

        alert("Failed to delete application.");

    }

}
if (window.location.pathname.includes("recruiter-applications.html")) {
    loadRecruiterApplications();
}
async function searchJobs() {

    const searchJob = document.getElementById("searchJob").value
        .toLowerCase();

    const searchLocation = document.getElementById("searchLocation").value
        .toLowerCase();

    try {

       const response = await fetch(
    `${API_URL}/jobs`
);

        const jobs = await response.json();

        const container = document.getElementById("jobsContainer");

        container.innerHTML = "";

        const filteredJobs = jobs.filter(job => {

            const title = job.title.toLowerCase();
            const location = job.location.toLowerCase();

            return title.includes(searchJob) &&
                   location.includes(searchLocation);
        });

        if (filteredJobs.length === 0) {

            container.innerHTML =
                "<p>No matching jobs found.</p>";

            return;
        }

        filteredJobs.forEach(job => {

            container.innerHTML += `
                <div class="job-card">

                    <h2>${job.title}</h2>

                    <h3>${job.company}</h3>

                    <p>📍 ${job.location}</p>

                    <p>💰 ${job.salary}</p>

                    <p>${job.description}</p>

                    <button onclick="applyJob('${job._id}', '${job.title}')">
                        Apply Now
                    </button>

                </div>
            `;

        });

    } catch (error) {

        console.log(error);

    }
}
function logoutUser() {

    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    window.location.href = "index.html";
}
const welcomeMessage = document.getElementById("welcomeMessage");

if (welcomeMessage) {

    const userName = localStorage.getItem("userName");

    if (userName) {
        welcomeMessage.innerText =
            "Welcome, " + userName + " 👋";
    }
}
const profileDisplayName =
    document.getElementById("profileDisplayName");

if (profileDisplayName) {

    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    document.getElementById("profileDisplayName").innerText =
        name || "Not available";

    document.getElementById("profileDisplayEmail").innerText =
        email || "Not available";

    document.getElementById("profileDisplayRole").innerText =
        role || "Not available";
}
async function updateProfile() {

    const oldEmail = localStorage.getItem("userEmail");

    const name = document.getElementById("profileName").value;
    const email = document.getElementById("profileEmail").value;

    if (!name || !email) {
        document.getElementById("profileMessage").innerText =
            "Please fill all fields";
        return;
    }

    try {

        const response = await fetch(
           `${API_URL}/update-profile/${oldEmail}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email
                })
            }
        );

        const data = await response.json();

        document.getElementById("profileMessage").innerText =
            data.message;

        if (data.message === "Profile updated successfully") {

            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);

        }

    } catch (error) {

        console.log(error);

        document.getElementById("profileMessage").innerText =
            "Something went wrong";
    }
}
function showEditProfile() {

    document.getElementById("editProfileBox").style.display =
        "block";

    document.getElementById("profileName").value =
        localStorage.getItem("userName") || "";

    document.getElementById("profileEmail").value =
        localStorage.getItem("userEmail") || "";
}
async function saveJob(jobId) {

    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Please login first");
        return;
    }

    try {

        const response = await fetch(
           `${API_URL}/save-job/${email}/${jobId}`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        alert(data.message);

    } catch (error) {

        console.log(error);
        alert("Something went wrong");

    }
}
async function loadSavedJobs() {

    const email = localStorage.getItem("userEmail");

    if (!email) {
        document.getElementById("savedJobsContainer").innerHTML =
            "<p>Please login first.</p>";
        return;
    }

  try {

    const response = await fetch(
        `${API_URL}/saved-jobs/${email}`
    );

    const jobs = await response.json();

        const container =
            document.getElementById("savedJobsContainer");

        container.innerHTML = "";

        if (jobs.length === 0) {
            container.innerHTML =
                "<p>No saved jobs yet.</p>";
            return;
        }

        jobs.forEach(job => {

            container.innerHTML += `
                <div class="job-card">

                    <h2>${job.title}</h2>

                    <h3>${job.company}</h3>

                    <p>📍 ${job.location}</p>

                    <p>💰 ${job.salary}</p>

                    <p>${job.description}</p>

                    <button onclick="applyJob('${job._id}')">
                        Apply Now
                    </button>
                  <button onclick="removeSavedJob('${job._id}')">
                 🗑️ Remove
                 </button>
                </div>
            `;

        });

    } catch (error) {

        console.log(error);

        document.getElementById("savedJobsContainer").innerHTML =
            "<p>Something went wrong.</p>";
    }
}
if (window.location.pathname.includes("saved-jobs.html")) {
    loadSavedJobs();
}
async function removeSavedJob(jobId) {

    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Please login first");
        return;
    }

    try {

        const response = await fetch(
          `${API_URL}/remove-saved-job/${email}/${jobId}`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        alert(data.message);

        if (data.message === "Job removed from saved jobs") {
            loadSavedJobs();
        }

    } catch (error) {

        console.log(error);
        alert("Something went wrong");

    }
}
async function updateApplicationStatus(applicationId, status) {

    try {

        const response = await fetch(
        `${API_URL}/application-status/${applicationId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        if (
            data.message ===
            "Application status updated successfully"
        ) {
            loadRecruiterApplications();
        }

    } catch (error) {

        console.log(error);

        alert("Something went wrong");

    }
}
async function uploadResume() {

    const fileInput = document.getElementById("resume");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("resumeMessage").innerText =
            "Please select a resume";
        return;
    }

    const formData = new FormData();

    formData.append("resume", file);
    const email = localStorage.getItem("userEmail");

formData.append("email", email);

    try {

        const response = await fetch(
        `${API_URL}/upload-resume` ,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        document.getElementById("resumeMessage").innerText =
            data.message;

    } catch (error) {

        console.log(error);

        document.getElementById("resumeMessage").innerText =
            "Something went wrong";

    }
}
function viewResume() {

    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    fetch(`${API_URL}/profile/${email}`)
        .then(response => response.json())
        .then(data => {

            if (!data.resume) {
                alert("No resume uploaded yet.");
                return;
            }
window.open(
    `${API_URL}/uploads/${data.resume}`,
    "_blank"
);

        })
        .catch(error => {

            console.log(error);
            alert("Unable to open resume.");

        });
}
function changeResume() {

    document.getElementById("changeResumeFile").click();

}


async function uploadChangedResume() {

    const fileInput = document.getElementById("changeResumeFile");
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Please login first");
        return;
    }

    const formData = new FormData();

    formData.append("resume", file);
    formData.append("email", email);

    try {

        const response = await fetch(
          `${API_URL}/upload-resume` ,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            document.getElementById("resumeStatus").innerText =
                "Resume uploaded successfully: " + file.name;
        }

    } catch (error) {

        console.log(error);

        alert("Something went wrong");

    }
}
function updateHomeNavigation() {

    const authLinks =
        document.getElementById("authLinks");

    const dashboardLink =
        document.getElementById("dashboardLink");

    const email =
        localStorage.getItem("userEmail");

    const role =
        localStorage.getItem("userRole");


    // User is logged in
    if (email) {

        // Dashboard according to role
        if (role === "Recruiter") {

            dashboardLink.innerHTML = `
                <a href="recruiter.html">
                    Dashboard
                </a>
            `;

        } else {

            dashboardLink.innerHTML = `
                <a href="dashboard.html">
                    Dashboard
                </a>
            `;

        }


        // Show Logout
        authLinks.innerHTML = `
            <a href="#" onclick="logout()">
                Logout
            </a>
        `;

    }


    // User is not logged in
    else {

        dashboardLink.innerHTML = "";

        authLinks.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;

    }

}

function logout() {

    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    window.location.href = "index.html";
}


updateHomeNavigation();
async function loadPostedJobs() {

    try {

        const response = await fetch(
            `${API_URL}/jobs`
        );

        const jobs = await response.json();

        const container =
            document.getElementById("postedJobs");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (jobs.length === 0) {

            container.innerHTML =
                "<p>No jobs posted yet.</p>";

            return;
        }

        jobs.forEach(job => {

            container.innerHTML += `

                <div class="job-card">

                    <h2>${job.title}</h2>

                    <p>🏢 ${job.company}</p>

                    <p>📍 ${job.location}</p>

                    <p>💰 ${job.salary}</p>

                    <p>${job.description}</p>
                    <button
    class="edit-job-btn"
    onclick="editJob(
        '${job._id}',
        '${job.title}',
        '${job.company}',
        '${job.location}',
        '${job.salary}',
        '${job.description}'
    )"
>
    ✏️ Edit Job
</button>

                    <button
                        onclick="deleteJob('${job._id}')">
                        🗑️ Delete Job
                    </button>

                </div>

            `;

        });

    } catch (error) {

        console.log(error);

    }

}
if (window.location.pathname.includes("recruiter.html")) {
    loadPostedJobs();
}
async function deleteJob(jobId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
         `${API_URL}/jobs/${jobId}`  ,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        alert(data.message);

        // Refresh posted jobs
        loadPostedJobs();

    } catch (error) {

        console.log("Delete Job Error:", error);

        alert("Failed to delete job");

    }

}
function editJob(
    jobId,
    title,
    company,
    location,
    salary,
    description
) {

    const newTitle = prompt(
        "Enter Job Title:",
        title
    );

    if (newTitle === null) return;


    const newCompany = prompt(
        "Enter Company Name:",
        company
    );

    if (newCompany === null) return;


    const newLocation = prompt(
        "Enter Location:",
        location
    );

    if (newLocation === null) return;


    const newSalary = prompt(
        "Enter Salary:",
        salary
    );

    if (newSalary === null) return;


    const newDescription = prompt(
        "Enter Job Description:",
        description
    );

    if (newDescription === null) return;


    updateJob(
        jobId,
        newTitle,
        newCompany,
        newLocation,
        newSalary,
        newDescription
    );

}
async function updateJob(
    jobId,
    title,
    company,
    location,
    salary,
    description
) {

    try {

      const response = await fetch(
    `${API_URL}/jobs/${jobId}`,
    {
        method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    company: company,
                    location: location,
                    salary: salary,
                    description: description
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        // Refresh posted jobs
        loadPostedJobs();

    } catch (error) {

        console.log("Update Job Error:", error);

        alert("Failed to update job");

    }

}
async function loadDashboardStats() {

    // =========================
    // TOTAL JOBS
    // =========================

    try {

        const jobsResponse = await fetch(
    `${API_URL}/jobs`
);

        const jobs = await jobsResponse.json();

        document.getElementById("totalJobs").innerText =
            jobs.length;

    } catch (error) {

        console.log("Jobs Stats Error:", error);

    }


    // =========================
    // APPLICATIONS
    // =========================

    try {

       const applicationsResponse = await fetch(
    `${API_URL}/all-applications`
);

        const applications =
            await applicationsResponse.json();

        document.getElementById("totalApplications").innerText =
            applications.length;


        // =========================
        // UNIQUE CANDIDATES
        // =========================

        const candidates = new Set();

        applications.forEach(application => {

            candidates.add(
                application.applicantEmail
            );

        });

        document.getElementById("totalCandidates").innerText =
            candidates.size;

    } catch (error) {

        console.log(
            "Application Stats Error:",
            error
        );

    }

}
if (window.location.pathname.includes("recruiter.html")) {

    loadDashboardStats();

}


function toggleDarkMode() {

    if (document.body.classList.contains("dark-mode")) {

        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");

    } else {

        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");

    }

    updateThemeButton();
}


function applyTheme() {

    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    updateThemeButton();
}


function updateThemeButton() {

    const button = document.getElementById("themeButton");

    if (!button) {
        return;
    }

    if (document.body.classList.contains("dark-mode")) {
        button.innerText = "☀️ Light Mode";
    } else {
        button.innerText = "🌙 Dark Mode";
    }

}


applyTheme();
console.log("Theme:", localStorage.getItem("theme"));
console.log("Dark mode applied:", document.body.classList.contains("dark-mode"));
function togglePassword(passwordId, eyeId) {

    const passwordInput =
        document.getElementById(passwordId);

    const eyeButton =
        document.getElementById(eyeId);

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        eyeButton.innerText = "👁️‍🗨️";

    } else {

        passwordInput.type = "password";

        eyeButton.innerText = "👁️";

    }
}