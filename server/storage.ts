import { users, chatSessions, messages, type User, type InsertUser, type ChatSession, type InsertChatSession, type Message, type InsertMessage, type ChatSessionWithMessages } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: string, credits: number): Promise<void>;
  
  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionWithMessages(id: string): Promise<ChatSessionWithMessages | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSessionTitle(id: string, title: string): Promise<void>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getSessionMessages(sessionId: string): Promise<Message[]>;
  
  // Admin
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; totalMessages: number; }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCredits(id: string, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async getChatSessionWithMessages(id: string): Promise<ChatSessionWithMessages | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    if (!session) return undefined;

    const sessionMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, id))
      .orderBy(messages.createdAt);

    return {
      ...session,
      messages: sessionMessages,
    };
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateChatSessionTitle(id: string, title: string): Promise<void> {
    await db
      .update(chatSessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatSessions.id, id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; totalMessages: number; }> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalMessagesResult] = await db.select({ count: count() }).from(messages);
    
    // For simplicity, considering users with recent sessions as active
    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(chatSessions, eq(users.id, chatSessions.userId))
      .where(sql`${chatSessions.updatedAt} > NOW() - INTERVAL '7 days'`);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalMessages: totalMessagesResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
