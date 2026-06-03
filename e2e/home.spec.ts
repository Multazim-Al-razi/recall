import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads the hero section with headline and CTA button", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(
      "The money leaving your account, finally in your hands",
    );

    const getStartedLink = page.getByRole("link", {
      name: "Start tracking free",
    });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", "/onboarding");
  });

  test("displays feature sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Never miss a renewal")).toBeVisible();
    await expect(page.getByText("See where money goes")).toBeVisible();
    await expect(page.getByText("Find quiet savings")).toBeVisible();
  });

  test("bottom CTA links to onboarding", async ({ page }) => {
    await page.goto("/");
    const bottomCta = page.getByRole("link", { name: "Get started" }).last();
    await expect(bottomCta).toBeVisible();
    await expect(bottomCta).toHaveAttribute("href", "/onboarding");
  });
});
