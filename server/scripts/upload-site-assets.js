// Uploads static frontend assets to Cloudinary so the site can serve
// optimized versions (f_auto, q_auto, resized) instead of multi-MB originals.
// Usage: node scripts/upload-site-assets.js [page]   (default page: home)
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, "..", "..", "my-building-app", "src", "assets");

const PAGES = {
  home: [
    "hero-bg.jpg", "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg",
    "how_it_works.mp4", "fundraising-example.jpg", "donation.jpg", "invest.webp", "plan.png",
    "property1.jpg", "property2.jpg", "property3.jpg", "property4.jpg", "property5.jpg", "property6.jpg",
    "investor1.jpg", "investor2.jpg", "investor3.jpg", "starter.jpg", "growth-chart.jpg", "finallogo.png",
  ],
  // Browse contributors, how to contribute, verified opportunities, raising, how to start a raising
  pages: ["investors-hero.jpg", "fundraising-hero.jpg", "secure.png", "startup-sample.jpg"],
};

async function main() {
  const page = process.argv[2] || "home";
  const files = PAGES[page];
  if (!files) throw new Error(`Unknown page "${page}". Options: ${Object.keys(PAGES).join(", ")}`);

  for (const file of files) {
    const publicId = path.parse(file).name;
    // Free plan rejects files > 10 MB; ASSET_OVERRIDE_DIR can hold pre-shrunk copies.
    const override = process.env.ASSET_OVERRIDE_DIR && path.join(process.env.ASSET_OVERRIDE_DIR, file);
    const source = override && fs.existsSync(override) ? override : path.join(ASSETS_DIR, file);
    const result = await cloudinary.uploader.upload(source, {
      folder: `building-app/${page}`,
      public_id: publicId,
      resource_type: "auto",
      overwrite: true,
    });
    console.log(`${file} -> ${result.resource_type}/${result.public_id} (${Math.round(result.bytes / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
