import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("Cleaning up test environment...");

  // Optional: Clean up test data, remove test users, etc.
  // This is where you would clean up any test data created during testing

  try {
    // Example cleanup operations:
    // - Remove test users from database
    // - Clean up test files
    // - Reset application state

    console.log("Test environment cleanup completed successfully");
  } catch (error) {
    console.error("Error during test environment cleanup:", error);
    // Don't throw error here as it might mask test failures
  }
}

export default globalTeardown;
