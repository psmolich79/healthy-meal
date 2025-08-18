import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  if (!baseURL) {
    console.warn("No baseURL configured, skipping global setup");
    return;
  }

  console.log(`Setting up test environment for: ${baseURL}`);

  // Launch browser and create context
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if the application is accessible
    await page.goto(baseURL);

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if the page is accessible
    const title = await page.title();
    console.log(`Application is accessible. Page title: ${title}`);

    // Optional: Set up test data or authentication here
    // For example, create test user, set up test preferences, etc.
  } catch (error) {
    console.error("Failed to access application during global setup:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
