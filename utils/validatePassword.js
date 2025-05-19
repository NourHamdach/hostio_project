// utils/validatePassword.js
module.exports = function validatePassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (
      password.length < minLength ||
      !hasUpper ||
      !hasLower ||
      !hasNumber ||
      !hasSpecial
    ) {
      return {
        valid: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      };
    }
  
    return { valid: true };
  };
  