import { expect, test } from "@playwright/test";

const publicRoutes = [
  ["/", /Collect fees|GetPay/i],
  ["/pricing", /Pick the plan|Pricing/i],
  ["/contact", /GetPay demo|GetPay team/i],
  ["/trial", /trial|institution/i],
  ["/terms", /Terms/i],
  ["/privacy", /Privacy/i],
  ["/refund-policy", /Refund/i],
  ["/support", /Support/i],
  ["/not-a-real-route", /route does not exist/i]
];

for (const [path, heading] of publicRoutes) {
  test(`public route ${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).toContainText(heading);
  });
}

test("login shell renders without a token", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("body")).toContainText(/Sign in|Welcome/i);
});

test("protected shells redirect unauthenticated users to login", async ({ page }) => {
  for (const path of ["/admin/dashboard", "/student/dashboard", "/super-admin/dashboard"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});
