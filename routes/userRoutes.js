const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", userController.createUser); 
router.get("/", userController.getAllUsers);

 

//Notes::: Express routes are matched top-down, so /users/me is mistakenly matched as /users/:id unless you put /me first.
router.get("/me", verifyToken, userController.getCurrentUser); // ✅ must come first


router.put("/edit-location", verifyToken, userController.updateUserLocation);
router.post("/logo-image", verifyToken, upload.single("image"), userController.uploadUserImage);
router.delete("/logo-image", verifyToken, userController.deleteUserImage);
router.put("/:id", userController.updateUser);
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);
module.exports = router;
