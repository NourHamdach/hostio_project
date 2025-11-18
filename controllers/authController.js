const bcrypt = require("bcryptjs");
const {sequelize} = require("../config/database/database"); // ✅ Import {sequelize} instance
const User = require("../models/User"); // ✅ Import models directly
const JobSeeker = require("../models/Jobseeker");
const Company = require("../models/Company");
const { generateTokens } = require("../utils/token");
const validatePassword = require("../utils/validatePassword");
const Country = require("../models/CompanyRelations/CompanyLocations/Country");
const City = require("../models/CompanyRelations/CompanyLocations/City");
const CompanyLocations = require("../models/CompanyRelations/CompanyLocations/CompanyLocations");
const Type=require("../models/CompanyRelations/CompanyType/Types");
const CompanySize=require("../models/CompanyRelations/CompanySize/CompanySize");
const { sendOTPEmail } = require("../services/emailService");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.registerWithEmail = async (req, res) => {
  try {
    const role = req.query.role;
    console.log("Received Role:", role);

    const { email, password, firstName, lastName, companyName } = req.body;

    if (!["jobseeker", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Extract username from email
    const username = email.split("@")[0].trim();

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      role,
      otp_code: otp,
      otp_expiration: otpExpiration,
      is_verified: false,
      authMethod: "otp",
    });

    let companyId = null;
    let jobSeekerId = null;

    if (role === "jobseeker") {
      const jobSeeker = await JobSeeker.create({
        userId: user.userId,
        firstName,
        lastName,
      });
      jobSeekerId = jobSeeker.jobSeekerId;
    } else if (role === "company") {
      const company = await Company.create({
        userId: user.userId,
        companyName,
      });
      companyId = company.companyId;
    }

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to email. Please verify.",
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        companyId,
        jobSeekerId,
        is_verified: user.is_verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Error during registration", error: error.message });
  }
};


/**
 * Redirect user to Google OAuth
 */
exports.googleAuthRedirect = (req, res) => {
  const { role } = req.params;
  if (role !== "jobseeker") {
    return res.status(403).json({ message: "Only jobseekers can sign up with Google" });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}/${role}&response_type=code&scope=email%20profile`;

  res.redirect(googleAuthUrl);
};


/**
 * 🔹 Handle Google OAuth Callback & Issue Tokens
 */
exports.googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { role } = req.params;

    if (role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can register using Google OAuth." });
    }

    if (!code) {
      return res.status(400).json({ message: "Authorization code is missing." });
    }

    // ✅ Fix: Use URLSearchParams for proper form encoding
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.GOOGLE_REDIRECT_URI}/${role}`,
      grant_type: "authorization_code",
      code,
    });

    console.log("🔍 Token exchange request:", {
      url: "https://oauth2.googleapis.com/token",
      redirect_uri: `${process.env.GOOGLE_REDIRECT_URI}/${role}`,
      client_id: process.env.GOOGLE_CLIENT_ID,
    });

    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // Step 2: Get user info from Google
    const googleUserResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, id: googleId, picture } = googleUserResponse.data;

    // Step 3: Find or create user
    let user = await User.findOne({ where: { email } });

    if (!user) {
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      user = await User.create({
        email,
        username: email.split("@")[0],
        firstName,
        lastName,
        role: "jobseeker",
        is_verified: true,
        authMethod: "google",
        googleId,
        password: null,
        imageUrl: picture || null,
      });

      await JobSeeker.create({
        userId: user.userId,
        firstName,
        lastName,
      });
    } else {
      const updates = {};
      if (!user.googleId) updates.googleId = googleId;
      if (!user.imageUrl && picture) updates.imageUrl = picture;
      if (!user.is_verified) updates.is_verified = true;
      
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }

      const existingSeeker = await JobSeeker.findOne({ where: { userId: user.userId } });
      if (!existingSeeker) {
        const nameParts = name.split(" ");
        await JobSeeker.create({
          userId: user.userId,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        });
      }
    }

    // Step 4: Generate tokens
    const jobSeeker = await JobSeeker.findOne({ where: { userId: user.userId } });

    const { accessToken, refreshToken } = generateTokens({
      userId: user.userId,
      email: user.email,
      role: user.role,
      jobSeekerId: jobSeeker?.jobSeekerId || null,
    });

    // ✅ Redirect to frontend with success
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-callback?token=${accessToken}&refresh=${refreshToken}&success=true`;
    console.log("✅ Google OAuth redirect:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    console.error("❌ Error response:", error.response?.data);
    
    const errorRedirectUrl = `${process.env.FRONTEND_URL}/oauth-callback?error=authentication_failed`;
    res.redirect(errorRedirectUrl);
  }
};



exports.verifyOTP = async (req, res) => {
  try {
    const { userId, email } = req.params;
    const { otp } = req.body;

    if (!userId || !email || !otp) {
      return res.status(400).json({ message: "User ID, Email, and OTP are required" });
    }

    const user = await User.findOne({ where: { userId, email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiration) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.is_verified = true;
    user.otp_code = null;
    user.otp_expiration = null;
    await user.save();
    let jobSeekerId = null;
    let companyId = null;

    if (user.role === "jobseeker") {
      const jobSeeker = await JobSeeker.findOne({ where: { userId: user.userId } });
      if (jobSeeker) jobSeekerId = jobSeeker.jobSeekerId;
    } else if (user.role === "company") {
      const company = await Company.findOne({ where: { userId: user.userId } });
      if (company) companyId = company.companyId;
    }

    // ✅ Fix function call (Matches imported function)
    const { accessToken, refreshToken } = generateTokens({
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId,
      jobSeekerId,
    });
    

    res.status(200).json({
      message: "OTP verified successfully, account activated",
      user: {
        userId: user.userId,
        email: user.email,
        is_verified: user.is_verified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("🔴 OTP Verification Error:", error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};


/**
 * 📩 API to Send OTP via Email
 * @route POST /api/auth/send-otp
 */
exports.sendOTP = async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email); // ✅ decode safely

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP and expiration time (10 minutes)
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // Update user record with OTP
    user.otp_code = otp;
    user.otp_expiration = otpExpiration;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully", email });
  } catch (error) {
    console.error("OTP Sending Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};


/**
 * 📌 Login API (Verify Authentication Method & Return JobSeekerID/CompanyID)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    let jobSeekerId = null;
    let companyId = null;

    if (user.role === "jobseeker") {
      const jobSeeker = await JobSeeker.findOne({ where: { userId: user.userId } });
      if (jobSeeker) jobSeekerId = jobSeeker.jobSeekerId;
    } else if (user.role === "company") {
      const company = await Company.findOne({ where: { userId: user.userId } });
      if (company) companyId = company.companyId;
    }

    // ✅ Check if user is verified
    if (!user.is_verified) {
      // Generate OTP and expiration time (10 minutes)
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // Update user record with OTP
    user.otp_code = otp;
    user.otp_expiration = otpExpiration;
    await user.save();
    
    // Send OTP via email
    await sendOTPEmail(email, otp);
      return res.status(403).json({ message: "Account not verified. Please verify your account first using otp.", verified:user.is_verified,user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },});
    }

    // ✅ Prevent login with Google account
    if (user.authMethod === "google") {
      return res.status(400).json({ message: "Use Google to login." });
    }

    // ✅ Compare password for OTP-based authentication
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

   

    // ✅ Fix function call (Matches imported function)
    const { accessToken, refreshToken } = generateTokens({
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId,
      jobSeekerId,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        verified:user.is_verified,
        companyId,
        jobSeekerId,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

/**
 * 📌 Refresh Token API (Generate New Access Token)
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findOne({ where: { userId: decoded.userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Generate new access token
      const newAccessToken = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = req.query.email;

    if (!otp || !newPassword || !email) {
      return res.status(400).json({ message: "OTP, new password, and email are required" });
    }

    const { valid, message } = validatePassword(newPassword);
    if (!valid) return res.status(400).json({ message });

    const user = await User.findOne({ where: { email, otp_code: otp } });

    if (!user) {
      return res.status(404).json({
        message: "User not found or invalid OTP",
      });
    }


    // ❌ Prevent Google-auth users from resetting password via OTP
    if (user.authMethod === "google") {
      return res.status(400).json({ message: "Google users must log in with Google. Password reset is not allowed." });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.otp_expiration)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp_code = null;
    user.otp_expiration = null;
    await user.save();

    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    if (user.role === "company") {
      const company = await Company.findOne({ where: { userId: user.userId } });
      if (company) payload.companyId = company.companyId;
    } else if (user.role === "jobseeker") {
      const seeker = await JobSeeker.findOne({ where: { userId: user.userId } });
      if (seeker) payload.jobSeekerId = seeker.jobSeekerId;
    }

    const { accessToken, refreshToken } = generateTokens(payload);

    res.json({ message: "Password reset successful", token: { accessToken, refreshToken } });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};




exports.resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email, old password, new password, and confirmation password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ❌ Prevent password reset for Google-auth accounts
    if (user.authMethod === "google") {
      return res.status(400).json({ message: "Google users must log in with Google. Password reset is not allowed." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match" });
    }

    const { valid, message } = validatePassword(newPassword);
    if (!valid) return res.status(400).json({ message });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};



exports.registerCompany = async (req, res) => {
  try {
    const {
      corporateEmail,
      password,
      repeatPassword,
      companyName,
      city,
      country,
      typeId,
      sizeId,
      firstName,
      lastName,
      codePhone,
      phoneNumber,
    } = req.body;

    const validationErrors = [];

const trimmedCompanyName = companyName?.trim();
const trimmedFirstName = firstName?.trim();
const trimmedLastName = lastName?.trim();
const trimmedEmail = corporateEmail?.trim();
const trimmedPhoneCode = codePhone?.trim();
const trimmedPhoneNumber = phoneNumber?.trim();

if (!trimmedEmail)
  validationErrors.push("corporateEmail is required.");
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
  validationErrors.push("Invalid email format.");

if (!password)
  validationErrors.push("password is required.");
if (!repeatPassword)
  validationErrors.push("repeatPassword is required.");
if (password && repeatPassword && password !== repeatPassword)
  validationErrors.push("Passwords do not match.");

const passwordCheck = validatePassword(password);
if (!passwordCheck.valid)
  validationErrors.push(passwordCheck.message);

if (!trimmedCompanyName)
  validationErrors.push("companyName is required.");
else {
  if (/^\d+$/.test(trimmedCompanyName))
    validationErrors.push("Company name cannot contain only numbers.");
  if (trimmedCompanyName.length > 50)
    validationErrors.push("Company name must be 100 characters or fewer.");
}

if (!trimmedFirstName)
  validationErrors.push("firstName is required.");
else {
  if (/^\d+$/.test(trimmedFirstName))
    validationErrors.push("First name cannot contain only numbers.");
  if (trimmedFirstName.length > 50)
    validationErrors.push("First name must be 50 characters or fewer.");
}

if (!trimmedLastName)
  validationErrors.push("lastName is required.");
else {
  if (/^\d+$/.test(trimmedLastName))
    validationErrors.push("Last name cannot contain only numbers.");
  if (trimmedLastName.length > 50)
    validationErrors.push("Last name must be 50 characters or fewer.");
}

if (!city || city.trim() === "")
  validationErrors.push("city is required.");

if (!country || country.trim() === "")
  validationErrors.push("country is required.");

if (!typeId)
  validationErrors.push("typeId is required.");
else if (isNaN(typeId))
  validationErrors.push("typeId must be a valid number.");

if (!sizeId)
  validationErrors.push("sizeId is required.");
else if (isNaN(sizeId))
  validationErrors.push("sizeId must be a valid number.");
if (!trimmedPhoneCode)
  validationErrors.push("codePhone is required.");
else if (!/^\+\d{1,5}$/.test(trimmedPhoneCode))
  validationErrors.push("codePhone must start with '+' and be 1–5 digits.");

if (!trimmedPhoneNumber)
  validationErrors.push("phoneNumber is required.");
else if (!/^\d{6,15}$/.test(trimmedPhoneNumber))
  validationErrors.push("phoneNumber must be 6–15 digits.");


const [typeExists, sizeExists] = await Promise.all([
  Type.findByPk(typeId),
  CompanySize.findByPk(sizeId),
]);

if (!typeExists)
  validationErrors.push("Invalid company type selected.");
if (!sizeExists)
  validationErrors.push("Invalid company size selected.");

// ❌ If any errors, return them
if (validationErrors.length > 0) {
  return res.status(400).json({ errors: validationErrors });
}


    // ✅ Check if user already exists
    const existingUser = await User.findOne({ where: { email: corporateEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // 🌍 Find or create Country
    let countryRecord = await Country.findOne({ where: { countryName: country } });
    if (!countryRecord) {
      countryRecord = await Country.create({ countryName: country });
    }

    // 🌆 Find or create City (scoped by countryId)
    let cityRecord = await City.findOne({
      where: {
        cityName: city,
        countryId: countryRecord.countryId,
      },
    });
    if (!cityRecord) {
      cityRecord = await City.create({
        cityName: city,
        countryId: countryRecord.countryId,
      });
    }

    // 🔐 Hash password and prepare user data
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    const username = corporateEmail.split("@")[0].trim();

    // 👤 Create User
    const user = await User.create({
      email: corporateEmail,
      username,
      password: hashedPassword,
      role: "company",
      otp_code: otp,
      otp_expiration: otpExpiration,
      is_verified: false,
      authMethod: "otp",
      firstName,
      lastName,
      countryId: countryRecord.countryId,
      cityId: cityRecord.cityId,
      phoneCode: codePhone || null,
      phoneNumber: phoneNumber || null,
    });

    // 🏢 Create Company
    const company = await Company.create({
      userId: user.userId,
      companyName,
      sizeId,
      typeId,
    });

    // 📍 Create Company Location (only cityId needed, country is inferred)
    await CompanyLocations.create({
      companyId: company.companyId,
      cityId: cityRecord.cityId,
    });

    // ✉️ Send OTP to email
    await sendOTPEmail(corporateEmail, otp);

    // ✅ Respond
    return res.status(200).json({
      message: "Company registered successfully. OTP sent to email.",
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        companyId: company.companyId,
      }
    });
  } catch (error) {
    console.error("Company Registration Error:", error);
    return res.status(500).json({
      message: "Error during company registration.",
      error: error.message,
    });
  }
};


exports.registerJobSeeker = async (req, res) => {
  try {
    const { email, password, repeatPassword, firstName, lastName, gender } = req.body;


    const validationErrors = [];

    const trimmedEmail = email?.trim();
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();

    // 🔹 Required Fields
    if (!trimmedEmail || !password || !repeatPassword || !trimmedFirstName || !trimmedLastName || !gender) {
      validationErrors.push("All required fields must be provided.");
    }

    // 🔹 Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      validationErrors.push("Email format is invalid.");
    }

    // 🔹 Gender
    const allowedGenders = ['male', 'female', 'other'];
    if (gender && !allowedGenders.includes(gender)) {
      validationErrors.push("Invalid gender. Allowed values: male, female, other.");
    }

    // 🔹 Password Match
    if (password !== repeatPassword) {
      validationErrors.push("Passwords do not match.");
    }

    
    const { valid, message } = validatePassword(password);
    if (!valid) return res.status(400).json({ message });
    

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    const username = email.split("@")[0].trim();

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      role:"jobseeker",
      otp_code: otp,
      otp_expiration: otpExpiration,
      is_verified: false,
      authMethod:"otp",
      firstName,
      lastName,
    });

    const jobSeeker = await JobSeeker.create({
      userId: user.userId,
      firstName,
      lastName,
      gender,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "Job seeker registered. OTP sent to email.",
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        jobSeekerId: jobSeeker.jobSeekerId,
      },
    
    });
  } catch (error) {
    console.error("Job Seeker Registration Error:", error);
    res.status(500).json({ message: "Error during job seeker registration", error: error.message });
  }
};
