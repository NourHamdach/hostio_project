const cloudinary = require("./config/cloudinary");

cloudinary.uploader.upload("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi2UMUlyMrRxvbPnZkmjKbvX9TIwgnkeSC5A&s", (error, result) => {
  if (error) {
    console.error("Cloudinary Error:", error);
  } else {
    console.log("Cloudinary Upload Success:", result);
  }
});