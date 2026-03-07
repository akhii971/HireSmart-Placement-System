import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@hiresmart.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("admin1234", 10);

    await User.create({
      name: "Super Admin",
      email,
      password: hashed,
      role: "admin",
      status: "Active",
    });

    console.log("🎉 Admin created:");
    console.log("Email: admin@hiresmart.com");
    console.log("Password: admin1234");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

run();