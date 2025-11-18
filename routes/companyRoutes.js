const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");
const companyController= require("../controllers/companyController");

const router = express.Router();

router.post("/", verifyToken,companyController.createCompany);
router.put("/", verifyToken, companyController.updateCompany);
router.get("/", companyController.getAllCompanies);


router.post("/upload-background_image", verifyToken, upload.single("image"), companyController.uploadCompanyBackgroundImage);
router.delete("/delete-background-image", verifyToken, companyController.deleteCompanyBackgroundImage);

router.put("/edit-description", verifyToken, companyController.updateCompanyDescription);
//key_facts
router.post("/key-facts", verifyToken,companyController.createCompanyKeyFact);
router.delete('/key-facts', verifyToken, companyController.deleteKeyFactById);
//albums
router.post("/albums",verifyToken,upload.array("photos"), companyController.createCompanyAlbum);
router.get("/Myalbums", verifyToken, companyController.getMyCompanyAlbums);
router.get("/albums-ByCompanyId", verifyToken, companyController.getAlbumsByCompanyId);
router.get("/album/photos", verifyToken, companyController.getPhotosByAlbumId);
router.delete("/album/photo",verifyToken,companyController.deletePhotoFromAlbum);
router.delete("/album",verifyToken ,companyController.deleteCompanyAlbum);
router.post("/album/photos",verifyToken,upload.array("photos"), companyController.addPhotosToAlbum);
// PUT /api/albums/:albumId
router.put("/album/title", verifyToken, companyController.updateAlbumTitle);
// Add this route too
router.delete('/media', verifyToken, companyController.deleteUploadedMedia);
router.put("/edit-name", verifyToken, companyController.editCompanyName);
router.get("/profile",companyController.getCompanyProfile);
router.get("/Myprofile",verifyToken,companyController.getMyCompanyProfile);
router.put("/Edit-address", verifyToken, companyController.updateCompanyAddress);
router.post("/media",verifyToken,upload.single("file"),companyController.uploadCompanyMedia);
router.get("/my-company-jobApplication", verifyToken,companyController.getCompanyJobApplicationsByStatus);
router.delete("/:userId", verifyToken, companyController.deleteCompany);


module.exports = router;
