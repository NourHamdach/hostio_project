const express = require("express");
 const cors = require("cors");
 require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const companyRoutes = require("./routes/companyRoutes");
const authRoutes=require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes")
const DemoRoutes = require("./routes/demoRoutes")
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const typeRoutes = require("./routes/typeRoutes");
 const companySizeRoutes = require("./routes/companySizeRoutes");
const stripeWebhook = require("./routes/stripeWebhook");
const minimumSeniorityRoutes = require("./routes/minimumSeniorityRoutes");
const contractDurationRoutes = require("./routes/durationOfContractsRoutes");



require("dotenv").config();

const app = express();
// Stripe raw parser must come BEFORE any body parser
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));


app.use(express.json());


app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002"],
  credentials: true,
}));


app.use("/api/webhooks/stripe", stripeWebhook);
// 👇 Mount under /api/admin
app.use("/api/admin", adminAuthRoutes);
app.use("/api/auth/",authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/demos",DemoRoutes)
app.use("/api/types", typeRoutes);
app.use("/api/company-sizes", companySizeRoutes);
app.use("/api/durations", contractDurationRoutes);

app.use("/api/seniority", minimumSeniorityRoutes);
const stripeRoutes = require('./routes/stripeRoutes');
app.use('/api/stripe', stripeRoutes);

module.exports = app;