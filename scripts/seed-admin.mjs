import bcrypt from "bcryptjs";
import fs from "fs";
import { MongoClient, ServerApiVersion } from "mongodb";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;

  for (const rawLine of fs.readFileSync(path, "utf8").split(/\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[match[1]] = value;
  }
}

loadEnvFile(".env.local");

const required = ["MONGODB_URI", "MONGODB_DB", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const now = new Date();
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const users = db.collection("users");

  await users.createIndexes([
    { key: { email: 1 }, unique: true, name: "users_email_unique" },
    { key: { role: 1 }, name: "users_role" },
    { key: { isActive: 1 }, name: "users_is_active" },
    { key: { createdAt: -1 }, name: "users_created_at" },
  ]);

  const existing = await users.findOne({ email });

  if (existing) {
    await users.updateOne(
      { email },
      {
        $set: {
          name: process.env.ADMIN_NAME.trim(),
          role: "super-admin",
          isActive: true,
          updatedAt: now,
        },
      },
    );
    console.log(`Admin user already exists and was updated: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await users.insertOne({
      name: process.env.ADMIN_NAME.trim(),
      email,
      passwordHash,
      role: "super-admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created super-admin user: ${email}`);
  }
} finally {
  await client.close();
}
