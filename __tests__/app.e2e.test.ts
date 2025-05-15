import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/app/app";

const prisma = new PrismaClient();

describe("Weather API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/weather returns 400 without city", async () => {
    await request(app).get("/api/weather").expect(400);
  });

  it("GET /api/weather returns data for valid city", async () => {
    const res = await request(app).get("/api/weather?city=London").expect(200);
    expect(res.body).toHaveProperty("temperature");
    expect(res.body).toHaveProperty("humidity");
    expect(res.body).toHaveProperty("description");
  });
});
