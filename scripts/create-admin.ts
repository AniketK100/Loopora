/**
 * Admin Creation Script
 *
 * Directly creates or updates an admin user in the MongoDB database.
 *
 * Usage: npx tsx scripts/create-admin.ts
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db/connection";
import { User } from "../src/lib/db/models/User";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const fallbackEnvPath = path.resolve(process.cwd(), ".env");
  let envFile = "";
  if (fs.existsSync(envPath)) {
    envFile = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(fallbackEnvPath)) {
    envFile = fs.readFileSync(fallbackEnvPath, "utf-8");
  } else {
    console.warn("Warning: No .env.local or .env file found.");
    return;
  }

  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}
loadEnv();

async function main() {
  const email = "admin@loopora.com";
  const password = "adminpassword123";
  const name = "Admin User";

  console.log(`[Admin Setup] Bootstrapping admin credentials in database...`);

  try {
    await connectDB();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      existing.role = "admin";
      existing.name = name;
      existing.passwordHash = passwordHash;
      existing.isPremium = true;
      await existing.save();
      console.log(`\n✅ Admin account updated!`);
    } else {
      await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        authProvider: "credentials",
        role: "admin",
        isPremium: true,
      });
      console.log(`\n✅ Admin account created!`);
    }

    console.log(`------------------------------------`);
    console.log(`Credentials:`);
    console.log(`- Email: ${email}`);
    console.log(`- Password: ${password}`);
    console.log(`- Role: admin`);
    console.log(`------------------------------------\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

main();
