import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { startBot } from "./bot";
import { insertArrestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start the Discord Bot
  try {
    await startBot();
  } catch (error) {
    console.error("Failed to start Discord bot:", error);
  }

  // API Routes
  app.get(api.arrests.list.path, async (req, res) => {
    const arrests = await storage.getArrests();
    res.json(arrests);
  });

  app.post(api.arrests.create.path, async (req, res) => {
    try {
      const input = insertArrestSchema.parse(req.body);
      const arrest = await storage.createArrest(input);
      res.status(201).json(arrest);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  return httpServer;
}

// Seed function (optional, can be called on startup if DB is empty)
async function seedDatabase() {
  const existing = await storage.getArrests();
  if (existing.length === 0) {
    console.log("Seeding database with example arrests...");
    await storage.createArrest({
      suspect: "John Doe",
      agency: "TES",
      officerDiscordId: "000000000000000000",
      officerName: "Officer Smith",
      charges: ["§ 22-1-1 – Petty Theft (M)", "§ 26-1-1 – Failure to Comply (M)"],
      description: "Subject was observed shoplifting at the convenience store. Fled on foot when approached.",
    });
    await storage.createArrest({
      suspect: "Jane Ro",
      agency: "TES",
      officerDiscordId: "000000000000000000",
      officerName: "Officer Jones", 
      charges: ["§ 29-1-5 – Reckless Driving (F)", "§ 29-3-5 – Evading (F)"],
      description: "High speed pursuit initiated on Highway 1. Subject spiked and taken into custody without incident.",
    });
  }
}

// Call seed (async, don't wait)
seedDatabase().catch(console.error);
