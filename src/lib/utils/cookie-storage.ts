/**
 * Cookie-based storage adapter for Supabase auth.
 * This allows the auth session to be shared between client and server.
 */

export class CookieStorage {
  getItem(key: string): string | null {
    if (typeof document === "undefined") return null;

    console.log("CookieStorage - getting key:", key);
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === key) {
        console.log("CookieStorage - found cookie for key:", key);
        return decodeURIComponent(value);
      }
    }
    console.log("CookieStorage - no cookie found for key:", key);
    return null;
  }

  setItem(key: string, value: string): void {
    if (typeof document === "undefined") return;

    console.log("CookieStorage - setting key:", key, "value length:", value.length);

    // Set cookie with proper attributes for security
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${location.protocol === "https:"}`;

    // Verify cookie was set
    console.log("CookieStorage - cookie set, current cookies:", document.cookie);
  }

  removeItem(key: string): void {
    if (typeof document === "undefined") return;

    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }
}
