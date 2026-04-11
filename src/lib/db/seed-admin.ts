import bcrypt from "bcryptjs";
import User from "./models/User";

let seeded = false;

export async function ensureAdminAccount(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";
  const company = process.env.ADMIN_COMPANY || "HireSense";

  if (!email || !password) return;

  const existing = await User.findOne({ email });

  if (existing) {
    // Verify password matches env var — update if it doesn't
    const matches = await bcrypt.compare(password, existing.passwordHash);
    if (!matches) {
      existing.passwordHash = await bcrypt.hash(password, 12);
      existing.name = name;
      existing.company = company;
      await existing.save();
      console.log(`[Seed] Admin account password synced: ${email}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, company, role: "admin" });

  console.log(`[Seed] Admin account created: ${email}`);
}
