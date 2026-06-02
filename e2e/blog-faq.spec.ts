import { test, expect } from "@playwright/test";

test.describe("Blog pages", () => {
  test("blog list page displays posts", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByText("The Recall Blog")).toBeVisible();

    // Should show at least the seed blog posts
    await expect(
      page.getByText("Why you have more subscriptions than you think"),
    ).toBeVisible();
    await expect(page.getByText("The free-trial trap")).toBeVisible();
  });

  test("blog posts show category, date, and read time", async ({ page }) => {
    await page.goto("/blog");

    // First post has category "Spending"
    await expect(page.getByText("Spending").first()).toBeVisible();
    // Date formatted
    await expect(page.getByText("May 28, 2026")).toBeVisible();
    // Read time
    await expect(page.getByText("4 min read")).toBeVisible();
  });

  test("clicking a blog post navigates to the post detail", async ({
    page,
  }) => {
    await page.goto("/blog");

    await page
      .getByText("Why you have more subscriptions than you think")
      .click();

    await expect(page).toHaveURL(
      /\/blog\/why-you-have-more-subscriptions-than-you-think/,
    );
    await expect(
      page.getByText("Why you have more subscriptions than you think"),
    ).toBeVisible();
  });

  test("blog post detail shows content blocks", async ({ page }) => {
    await page.goto("/blog/why-you-have-more-subscriptions-than-you-think");

    // Should show article content
    await expect(page.getByText("Where the gap hides")).toBeVisible();
    await expect(page.getByText("How to close the gap")).toBeVisible();
  });

  test("blog post detail shows key takeaways", async ({ page }) => {
    await page.goto("/blog/why-you-have-more-subscriptions-than-you-think");

    await expect(page.getByText("Key takeaways")).toBeVisible();
  });

  test("blog post detail shows back to blog link", async ({ page }) => {
    await page.goto("/blog/why-you-have-more-subscriptions-than-you-think");

    const backLink = page.getByRole("link", { name: /Back to blog/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL("/blog");
  });

  test("blog post detail shows CTA to get started", async ({ page }) => {
    await page.goto("/blog/free-trial-trap");

    const cta = page.getByRole("link", { name: /Get started free/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/onboarding");
  });

  test("invalid blog slug shows not found message", async ({ page }) => {
    await page.goto("/blog/nonexistent-post");

    await expect(page.getByText("Post not found")).toBeVisible();
    const backLink = page.getByRole("link", { name: /Back to blog/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/blog");
  });

  test("all seed blog posts have accessible detail pages", async ({ page }) => {
    const slugs = [
      "why-you-have-more-subscriptions-than-you-think",
      "free-trial-trap",
      "local-first-why-data-privacy-matters",
      "subscription-fatigue-and-how-to-beat-it",
    ];

    for (const slug of slugs) {
      await page.goto(`/blog/${slug}`);
      // Should not show "Post not found"
      await expect(page.getByText("Post not found")).not.toBeVisible();
      // Should have a title
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});

test.describe("FAQ (merged into the About page)", () => {
  test("displays all FAQ questions", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText("Frequently asked questions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /What is Recall\?/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Is my data sent to a server\?/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /How much does Recall cost\?/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Can I export my data\?/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Does Recall connect to my bank\?/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /What happens if I clear my browser data\?/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /Can I use Recall on multiple devices\?/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /How do renewal reminders work\?/ }),
    ).toBeVisible();
  });

  test("FAQ accordion expands and collapses", async ({ page }) => {
    await page.goto("/about");

    // Use the bank question — its answer is unique to the FAQ section.
    const answer = page.getByText(/Recall never asks for bank credentials/i);
    await expect(answer).not.toBeVisible();

    const question = page.getByRole("button", {
      name: /Does Recall connect to my bank\?/,
    });
    await question.click();
    await expect(answer).toBeVisible();

    await question.click();
    await expect(answer).not.toBeVisible();
  });

  test("can expand multiple FAQ items independently", async ({ page }) => {
    await page.goto("/about");

    await page
      .getByRole("button", { name: /Does Recall connect to my bank\?/ })
      .click();
    await expect(
      page.getByText(/Recall never asks for bank credentials/i),
    ).toBeVisible();

    await page.getByRole("button", { name: /Can I export my data\?/ }).click();
    await expect(
      page.getByText(/export all your subscriptions as a JSON file/i),
    ).toBeVisible();
    // First answer stays open.
    await expect(
      page.getByText(/Recall never asks for bank credentials/i),
    ).toBeVisible();
  });

  test("FAQ items have proper aria-expanded attributes", async ({ page }) => {
    await page.goto("/about");

    const firstButton = page.getByRole("button", { name: /What is Recall\?/ });
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");

    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  test("About FAQ links out to the full pricing page", async ({ page }) => {
    await page.goto("/about");

    const pricingLink = page.getByRole("link", { name: /See full pricing/i });
    await expect(pricingLink).toBeVisible();
    await expect(pricingLink).toHaveAttribute("href", "/pricing");
  });
});
