const User = require("../models/User");
const Country = require("../models/CompanyRelations/CompanyLocations/Country");
const City = require("../models/CompanyRelations/CompanyLocations/City");
const bcrypt = require("bcrypt");
const Company = require("../models/Company");
const JobSeeker = require("../models/Jobseeker");
const cloudinary = require("../config/cloudinary"); // Adjust path to your setup
const { v4: uuidv4 } = require('uuid'); // npm install uuid if not installed

exports.getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("🧠 Token payload:", req.user);

    if (!userId) {
      return res.status(400).json({ message: "Missing user ID in token" });
    }

    const user = await User.findOne({
      where: { userId },
      attributes: { exclude: ["password", "otp_code", "otp_expiration"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let jobSeekerId = null;
    let companyId = null;

    // 🛠 SAFETY: Wrap in try-catch to avoid crashing
    if (user.role === "jobseeker") {
      try {
        const seeker = await JobSeeker.findOne({ where: { userId } });
        jobSeekerId = seeker?.jobSeekerId || null;
      } catch (err) {
        console.error("❌ Error fetching jobseeker:", err.message);
      }
    } else if (user.role === "company") {
      try {
        const company = await Company.findOne({ where: { userId } });
        companyId = company?.companyId || null;
      } catch (err) {
        console.error("❌ Error fetching company:", err.message);
      }
    }

    return res.status(200).json({
      user: {
        ...user.dataValues,
        jobSeekerId,
        companyId,
      },
    });
  } catch (error) {
    console.error("🔥 getCurrentUser crash:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, otp_code, otp_expiration, is_verified } = req.body;

    if (!["jobseeker", "company"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'jobseeker' or 'company'." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      otp_code,
      otp_expiration,
      is_verified
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error creating user", details: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users", details: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user", details: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, otp_code, otp_expiration, is_verified } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (role && !["jobseeker", "company"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'jobseeker' or 'company'." });
    }

    const updatedData = { username, email, role, otp_code, otp_expiration, is_verified };
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updatedData);

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error updating user", details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user", details: error.message });
  }
};
exports.updateUserLocation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { countryName, cityName } = req.body;

    if (!countryName || !cityName) {
      return res.status(400).json({ message: "Both countryName and cityName are required" });
    }

    // ✅ Normalize inputs
    const trimmedCountry = countryName.trim();
    const trimmedCity = cityName.trim();

    // ✅ Find or create Country
    let country = await Country.findOne({
      where: { countryName: trimmedCountry },
    });

    if (!country) {
      country = await Country.create({ countryName: trimmedCountry });
    }

    // ✅ Find or create City (linked to the country)
    let city = await City.findOne({
      where: {
        cityName: trimmedCity,
        countryId: country.countryId,
      },
    });

    if (!city) {
      city = await City.create({
        cityName: trimmedCity,
        countryId: country.countryId,
      });
    }

    // ✅ Update user's location
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.countryId = country.countryId;
    user.cityId = city.cityId;
    await user.save();

    res.status(200).json({
      message: "User location updated successfully",
      countryId: country.countryId,
      cityId: city.cityId,
    });
  } catch (error) {
    console.error("Update User Location Error:", error);
    res.status(500).json({ message: "Failed to update location", error: error.message });
  }
};

// function extractUserImagePublicId(url) {
//   if (!url) return null;
//   const parts = url.split("/");
//   const filename = parts[parts.length - 1];
//   const [publicId] = filename.split(".");
//   const folder = parts[parts.length - 2]; // e.g., "user_images"
//   return `${folder}/${publicId}`; // e.g., "user_images/profile_image"
// }

function extractUserImagePublicId(imageUrl) {
  try {
    const parts = imageUrl.split("/");
    const fileWithExtension = parts[parts.length - 1];
    const publicId = fileWithExtension.split(".")[0];
    return `user_images/${publicId}`;
  } catch {
    return null;
  }
}



exports.uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { userId } = req.user;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Delete old image if exists
    if (user.imageUrl) {
      const publicId = extractUserImagePublicId(user.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    // ✅ Upload new image with a unique name (timestamp + uuid)
    const uniqueImageName = `profile_${userId}_${Date.now()}_${uuidv4()}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "user_images",
          public_id: uniqueImageName,
          overwrite: false, // don't overwrite!
          width: 500,
          crop: "scale",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    user.imageUrl = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "User image uploaded successfully",
      imageUrl: user.imageUrl,
    });

  } catch (error) {
    console.error("Upload User Image Error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};
exports.deleteUserImage = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.imageUrl) {
      return res.status(400).json({ message: "No image to delete" });
    }

    const publicId = extractUserImagePublicId(user.imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    user.imageUrl = null;
    await user.save();

    res.status(200).json({ message: "User image deleted successfully" });
  } catch (error) {
    console.error("Delete User Image Error:", error);
    res.status(500).json({ message: "Failed to delete user image", error: error.message });
  }
};
