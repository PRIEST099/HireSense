import { auth } from "@/lib/auth";

export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  const id = (session.user as unknown as Record<string, unknown>).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}
