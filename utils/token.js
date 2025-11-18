const jwt = require("jsonwebtoken");
const generateTokens = (user) => {
    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  
    if (user.role === "company") {
      payload.companyId = user.companyId; // ✅ Include companyId in token
    }
  
    if (user.role === "jobseeker") {
      payload.jobSeekerId = user.jobSeekerId;
    }
  
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  
    return { accessToken, refreshToken };
  };
  module.exports= {generateTokens};