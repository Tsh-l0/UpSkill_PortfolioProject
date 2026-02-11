const request = require("supertest");
const app = require("../app");

describe("Auth Routes", () => {
  it("responds to signup", async () => {
    const res = await request(app).post("/api/auth/signup").send({});
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Signup works!");
  });
});

