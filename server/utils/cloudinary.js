const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "dhieheffr",
  api_key: process.env.API_KEY || "493932859667533",
  api_secret: process.env.API_SECRET || "3Ys0Ez0iqMnhta4ntMX-IOx2Cmc",
});

const uploadToCloudinary = async (file, folder = "fundraisers") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path, // ✅ file.path (NOT file[0].path)
      { folder, resource_type: "auto" },
      (err, result) => {
        try {
          fs.unlinkSync(file.path);
        } catch {}
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

module.exports = { uploadToCloudinary };