 const mongoose = require("mongoose");
 const dotenv = require("dotenv");

const User = require("./models/userSchema.js");
const products = require("./data/Product.js");

dotenv.config();

 // Connect to the mongoDB database
 mongoose.connect(process.env.MONGO_URL);

 // Function to seed data
 const seedData = async () => {
     try {
         // Clear existing data
         
         await User.deleteMany();
        

         // Create a default admin User
         const createdUser = await User.create({
                 name: "Admin",
                email: "admin@avantgarde.com",
                 password: "nopass",
                 role: "admin",
             });
                    // Assign the default user ID to each product
         const userID = createdUser._id;

        

         console.log("Product data seeded successfully!!");
         process.exit();
     } catch (error) {
         console.error("Error seeding the data:", error );
           process.exit(1);
     }
 };

 seedData();