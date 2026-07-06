/**
 * Admin Promotion Utility Script — Local Development
 *
 * Promotes a registered user's account to the 'admin' or 'editor' role.
 * Used during local development and bootstrapping.
 *
 * Run via: `npx tsx scripts/promote.ts user@example.com admin`
 *
 * @module scripts/promote
 * @see 02_TRD.md §4 — Security (Role escalation restrictions)
 */

import fs from "fs";
import path from "path";
import { connectDB } from "../src/lib/db/connection";
import { User } from "../src/lib/db/models/User";
import { UserRole } from "../src/types";

// --- Custom Env Loader (Safe for script execution outside Next.js lifecycle) ---
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const fallbackEnvPath = path.resolve(process.cwd(), ".env");

  let envFile = "";
  if (fs.existsSync(envPath)) {
    envFile = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(fallbackEnvPath)) {
    envFile = fs.readFileSync(fallbackEnvPath, "utf-8");
  } else {
    console.warn("[Promote] Warning: No .env.local or .env file found.");
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
  const args = process.argv.slice(2);
  const email = args[0];
  const targetRole = (args[1] || "admin") as UserRole;

  if (!email) {
    console.error("Error: Please provide a user email address.");
    console.log("Usage: npx tsx scripts/promote.ts user@example.com [admin|editor|user]");
    process.exit(1);
  }

  if (!["admin", "editor", "user"].includes(targetRole)) {
    console.error(`Error: Invalid role '${targetRole}'. Role must be admin, editor, or user.`);
    process.exit(1);
  }

  console.log(`[Promote] Accessing DB to elevate ${email} to ${targetRole}...`);

  try {
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: No user found matching email address: ${email}`);
      process.exit(1);
    }

    const previousRole = user.role;
    user.role = targetRole;
    await user.save();

    console.log(`[Promote] Success! Elevated user details:`);
    console.log(`- ID: ${user._id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Previous Role: ${previousRole}`);
    console.log(`- Assigned Role: ${user.role} 🎉`);

    process.exit(0);
  } catch (error) {
    console.error("[Promote] Database connection error:", error);
    process.exit(1);
  }
}

main();
