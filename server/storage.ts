import { db } from "./db";
import { arrests, type InsertArrest, type Arrest } from "@shared/schema";

export interface IStorage {
  getArrests(): Promise<Arrest[]>;
  createArrest(arrest: InsertArrest): Promise<Arrest>;
}

export class DatabaseStorage implements IStorage {
  async getArrests(): Promise<Arrest[]> {
    // Return newest first
    return await db.select().from(arrests).orderBy(arrests.createdAt);
  }

  async createArrest(insertArrest: InsertArrest): Promise<Arrest> {
    const [arrest] = await db.insert(arrests).values(insertArrest).returning();
    return arrest;
  }
}

export const storage = new DatabaseStorage();
