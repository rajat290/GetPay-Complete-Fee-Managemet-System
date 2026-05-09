const express = require("express");
const request = require("supertest");

const publicRoutes = require("../../routes/publicRoutes");
const Lead = require("../../models/Lead");
const WebsiteContent = require("../../models/WebsiteContent");
const LegalPage = require("../../models/LegalPage");

const app = express();
app.use(express.json());
app.use("/api/public", publicRoutes);

describe("public website and lead capture", () => {
  it("captures demo requests as sales leads", async () => {
    const res = await request(app)
      .post("/api/public/leads")
      .send({
        source: "request_demo",
        institutionName: "North Star College",
        institutionType: "college",
        contactName: "Dean Finance",
        contactEmail: "dean@northstar.edu",
        contactPhone: "+91 98888 11111",
        planInterest: "growth",
        message: "We want a fee collection demo."
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const lead = await Lead.findById(res.body.leadId);
    expect(lead.source).toBe("request_demo");
    expect(lead.status).toBe("new");
    expect(lead.planInterest).toBe("growth");
  });

  it("serves default public website content and legal pages", async () => {
    const contentRes = await request(app).get("/api/public/website-content");
    expect(contentRes.status).toBe(200);
    expect(contentRes.body.hero.title).toBeTruthy();

    const content = await WebsiteContent.findOne({ key: "default" });
    expect(content.pricingPlans.length).toBeGreaterThan(0);

    const legalRes = await request(app).get("/api/public/legal/privacy");
    expect(legalRes.status).toBe(200);
    expect(legalRes.body.slug).toBe("privacy");

    const legalPage = await LegalPage.findOne({ slug: "privacy" });
    expect(legalPage.status).toBe("published");
  });

  it("rejects invalid lead submissions", async () => {
    const res = await request(app)
      .post("/api/public/leads")
      .send({
        source: "contact",
        institutionName: "Broken School",
        contactName: "No Email",
        contactEmail: "not-an-email",
        message: "Help"
      });

    expect(res.status).toBe(400);
  });
});
