import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(userId: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid: userId,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Database user operation failed.", { cause: error });
  }
}

export async function getUserByUid(userId: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, userId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database fetch user failed:", error);
    throw new Error("Database fetch user failed.", { cause: error });
  }
}

