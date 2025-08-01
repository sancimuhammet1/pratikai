import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, generateSessionTitle } from "./services/ai";
import { requireAuth } from "./services/auth";
import { insertUserSchema, insertChatSessionSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Firebase Admin SDK devre dışı olduğu için geçici çözüm
  const authMiddleware = async (req: any, res: any, next: any) => {
    try {
      // Authorization header'dan Firebase UID'yi çıkar
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No authentication token provided" });
      }
      
      // Token'dan UID'yi çıkarmaya çalış (geçici çözüm)
      const token = authHeader.split('Bearer ')[1];
      // Firebase token decode etmeyi basit JWT decode ile yapıyoruz
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const uid = payload.user_id || payload.sub;
        console.log('Decoded Firebase token UID:', uid);
        req.user = { uid };
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        req.user = { uid: "unknown-user" };
      }
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Admin middleware
  const adminMiddleware = async (req: any, res: any, next: any) => {
    try {
      console.log('Admin middleware - looking for user with UID:', req.user.uid);
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      console.log('Admin middleware - found user:', user);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      res.status(403).json({ message: "Access denied" });
    }
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Firebase Admin SDK çalışmıyorsa, client-side bilgileri doğrudan kullan
      const { uid, email, name } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ message: "Missing user information" });
      }
      const decodedToken = { uid, email, name };

      const userData = insertUserSchema.parse({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email!,
        name: decodedToken.name || decodedToken.email!.split('@')[0],
        profession: req.body.profession || null,
      });

      const existingUser = await storage.getUserByFirebaseUid(decodedToken.uid);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Chat routes
  app.get("/api/chat/sessions", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const sessions = await storage.getUserChatSessions(user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });

  app.post("/api/chat/sessions", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const sessionData = insertChatSessionSchema.parse({
        userId: user.id,
        profession: req.body.profession,
        title: req.body.title || "Yeni Sohbet",
      });

      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(400).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/chat/sessions/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const session = await storage.getChatSessionWithMessages(req.params.id);
      if (!session || session.userId !== user.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  app.post("/api/chat/sessions/:id/messages", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== user.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (user.credits < 3) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        sessionId: session.id,
        role: "user",
        content: content.trim(),
        creditsUsed: 0,
      });

      // Get conversation history for AI
      const messages = await storage.getSessionMessages(session.id);
      const conversationHistory = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Generate AI response
      const { response, creditsUsed } = await generateChatResponse(
        conversationHistory,
        session.profession
      );

      // Create AI message
      const aiMessage = await storage.createMessage({
        sessionId: session.id,
        role: "assistant",
        content: response,
        creditsUsed,
      });

      // Update user credits
      await storage.updateUserCredits(user.id, user.credits - creditsUsed);

      // Update session title if this is the first message
      if (messages.length === 1) {
        const title = generateSessionTitle(content);
        await storage.updateChatSessionTitle(session.id, title);
      }

      res.json({
        userMessage,
        aiMessage,
        creditsUsed,
        remainingCredits: user.credits - creditsUsed,
      });
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // User routes
  app.get("/api/user/stats", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const sessions = await storage.getUserChatSessions(user.id);
      const totalChats = sessions.length;
      
      // Calculate used credits (starting credits - current credits)
      const usedCredits = 1000 - user.credits;

      res.json({
        totalChats,
        usedCredits,
        avgSession: "24dk", // Placeholder - would need more complex calculation
        satisfaction: 4.8, // Placeholder - would need rating system
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json({
        totalUsers: stats.totalUsers,
        activeSessions: stats.activeUsers,
        dailyMessages: stats.totalMessages,
        apiUsage: "87%", // Placeholder
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
